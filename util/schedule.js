"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeSchedule = void 0;
const typeorm_1 = require("typeorm");
const PostToPacs_1 = require("../entity/PostToPacs");
const crontab_1 = require("../entity/crontab");
const rabbitMQ_1 = require("../util/rabbitMQ");
const SysLogs_1 = require("../entity/SysLogs");
const DICOMRecords_1 = require("../entity/DICOMRecords");
const JsonFileRecord_1 = require("../entity/JsonFileRecord");
const path = require('path');
const config_data = require('../global.json');
const schedule = require('node-schedule');
let jobArray = [];
const logger = require("./logger");
const fs = require("fs");
class nodeSchedule {
    constructor() {
        this.orm_postToPacs = (0, typeorm_1.getRepository)(PostToPacs_1.PostToPacs);
        this.rabbits = new rabbitMQ_1.rabbit();
        this.orm_crontab = (0, typeorm_1.getRepository)(crontab_1.crontab_entity);
        this.orm_Log = (0, typeorm_1.getRepository)(SysLogs_1.SysLog);
        this.orm_recs = (0, typeorm_1.getRepository)(DICOMRecords_1.DICOMRecords);
        this.orm_jsonfile = (0, typeorm_1.getRepository)(JsonFileRecord_1.JsonFileRecord);
    }
    initSchedule() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const CrontabContent = yield this.orm_crontab.findOne({ where: { name: "default" } });
            if (((_b = (_a = config_data.global) === null || _a === void 0 ? void 0 : _a.hospital) === null || _b === void 0 ? void 0 : _b.toUpperCase()) === "VGHTC") {
                let newRule = new schedule.RecurrenceRule();
                newRule.hour = 18;
                newRule.minute = 0;
                schedule.scheduleJob(newRule, () => {
                    this.checkFileSync();
                });
            }
            if (!CrontabContent) {
                const now = new Date(Date.now());
                const _obj = new crontab_1.crontab_entity();
                _obj.created_time = now;
                _obj.upd_time = now;
                _obj.name = "default";
                _obj.content = JSON.stringify([
                    { key: 10001, hour: 12, min: 30 },
                    { key: 10002, hour: 17, min: 0 },
                    { key: 10003, hour: 21, min: 0 },
                ]);
                yield this.orm_crontab.save(_obj);
            }
            else {
                const scheduleRecord = JSON.parse(CrontabContent.content);
                const schduleLen = scheduleRecord.length;
                for (let i = 0; i < schduleLen; i++) {
                    yield this.addSchedule(scheduleRecord[i].hour, scheduleRecord[i].min);
                }
            }
        });
    }
    checkFileSync() {
        const copyPath = "/RESTful/vghtc_file";
        const filePath = "/RESTful/copy_file";
        let readDirAry = [];
        try {
            if (!fs.existsSync(filePath)) {
                fs.mkdirSync(filePath);
            }
            if (!fs.existsSync(copyPath)) {
                fs.mkdirSync(copyPath);
            }
            fs.readdir(copyPath, { withFileTypes: true }, (err, files) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    console.log(`readdir error:${err}`);
                    return;
                }
                let qry_jsonRecord = yield this.orm_jsonfile.find();
                for (let file of files) {
                    readDirAry.push({ name: file.name });
                }
                for (let i = 0, aryLen = qry_jsonRecord.length; i < aryLen; i++) {
                    const isExist = readDirAry.findIndex(item => {
                        return item.name == qry_jsonRecord[i].name;
                    });
                    logger.info(`${qry_jsonRecord[i].name} isExist ${isExist}`);
                    if (isExist == -1) {
                        const relateCopyPath = path.join(process.cwd(), '/copy_file', qry_jsonRecord[i].name);
                        const relateFileCopyPath = path.join(process.cwd(), '/vghtc_file', qry_jsonRecord[i].name);
                        let failCount = 0;
                        let isError = yield this.copyFiles({ origin_file: relateCopyPath, copy_file: relateFileCopyPath });
                        while (failCount < 3 && !isError) {
                            logger.info(`copied files error retry ${failCount}.`);
                            isError = yield this.copyFiles({ origin_file: relateCopyPath, copy_file: relateFileCopyPath });
                            failCount++;
                        }
                        if (isError) {
                            const findTheJsonRecord = yield this.orm_jsonfile.findOne({ where: { name: qry_jsonRecord[i].name } });
                            ;
                            yield this.orm_jsonfile.remove(findTheJsonRecord);
                        }
                    }
                    else {
                        const findTheJsonRecord = yield this.orm_jsonfile.findOne({ where: { name: qry_jsonRecord[i].name } });
                        ;
                        logger.info(`Record remove ${qry_jsonRecord[i].name}.`);
                        yield this.orm_jsonfile.remove(findTheJsonRecord);
                    }
                }
            }));
        }
        catch (error) {
            logger.error(`schedule copy file check error ${error}`);
        }
    }
    copyFiles({ origin_file, copy_file }) {
        return new Promise((resolve, reject) => {
            fs.copyFile(origin_file, copy_file, 0, (err) => {
                if (err) {
                    console.log(`copy file error:${err}`);
                    reject(false);
                }
                else {
                    resolve(true);
                }
            });
        });
    }
    addSchedule(hour, min) {
        logger.info(`Add schedule ${hour}:${min}.`);
        let rule = new schedule.RecurrenceRule();
        rule.hour = hour;
        rule.minute = min;
        let job = schedule.scheduleJob(rule, () => {
            this.postToPacs();
        });
        jobArray.push(job);
    }
    clearSchedule() {
        const clearLen = jobArray.length;
        for (let i = 0; i < clearLen; i++) {
            const jobs = jobArray[i];
            jobs.cancel();
        }
        jobArray = [];
    }
    postToPacs() {
        return __awaiter(this, void 0, void 0, function* () {
            const allDicomData = yield this.orm_postToPacs.find();
            const totalLen = allDicomData.length;
            const now = new Date(Date.now());
            logger.info(`Start auto Post to Pacs. tiem: ${now} , total: ${totalLen}.`);
            for (let i = 0; i < totalLen; i++) {
                let MQ_message_toOri = {
                    req_time: this.MQ_time(),
                    upload_content_type: config_data.global.dicomContentType || 2,
                    seriesId: allDicomData[i].seriesId,
                    modality: allDicomData[i].AET
                };
                yield this.rabbits.connecting('wp_MED01-UPLOAD', MQ_message_toOri);
                yield this.orm_postToPacs.remove(allDicomData[i]);
                let dicom_rec = yield this.orm_recs.findOne({ where: { seriesId: allDicomData[i].seriesId } });
                dicom_rec.processStatus = 2;
                yield this.orm_recs.save(dicom_rec);
                const LogMessage = {
                    evtType: 21,
                    evtDatetime: now,
                    content: `Post to Pacs ${allDicomData[i].seriesId} to ${allDicomData[i].AET}`,
                };
                yield this.orm_Log.save(LogMessage);
                yield this.waitSec(50);
            }
        });
    }
    waitSec(waitTime) {
        return new Promise((resole => {
            setTimeout(() => {
                resole(true);
            }, waitTime);
        }));
    }
    MQ_time() {
        var nowTimte = new Date();
        var text = "";
        var hours = nowTimte.getHours() < 10 ? "0" + nowTimte.getHours() : nowTimte.getHours();
        text = text + nowTimte.getFullYear();
        text = text + ((nowTimte.getMonth() + 1) < 10 ? "0" + (nowTimte.getMonth() + 1) : (nowTimte.getMonth() + 1));
        text =
            text +
                (nowTimte.getDate() >= 10 ? nowTimte.getDate() : "0" + nowTimte.getDate());
        text = text + hours;
        text = text + nowTimte.getMinutes();
        return text;
    }
}
exports.nodeSchedule = nodeSchedule;
