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
exports.SysLogController = void 0;
const typeorm_1 = require("typeorm");
const SysLogs_1 = require("../entity/SysLogs");
class SysLogController {
    constructor() {
        this.orm_repository = (0, typeorm_1.getRepository)(SysLogs_1.SysLog);
    }
    getLogsSearch(request, response, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let now = new Date("1900-01-01");
            let evtTypes = request.query.type;
            let keyWord = request.query.content;
            let _timeFilter = request.query.time;
            const _page = Number(request.query.page) || 0;
            const _limit = Number(request.query.limits) || 10;
            const _indexNum = _page ? _page * _limit : 0;
            const _export = (_a = request.query) === null || _a === void 0 ? void 0 : _a.export;
            switch (true) {
                case _timeFilter == "last1hour":
                    {
                        now = new Date(new Date().getTime() - 1 * 60 * 60 * 1000);
                    }
                    break;
                case _timeFilter == "last1day":
                    {
                        now = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
                    }
                    break;
                case _timeFilter == "last7day":
                    {
                        now = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
                    }
                    break;
                case _timeFilter == "last30day":
                    {
                        now = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
                    }
                    break;
                default:
                    now;
                    break;
            }
            let logContent;
            let logCount = 0;
            if (!_timeFilter) {
                logCount = yield this.orm_repository.count();
            }
            if (_export) {
                logContent = yield this.orm_repository.createQueryBuilder("log").select().orderBy("evtDatetime", "DESC").getMany();
            }
            else {
                if (evtTypes && keyWord) {
                    logContent = yield this.orm_repository.createQueryBuilder("log").select().where("log.evtDatetime >= :nowTime", { nowTime: now }).andWhere("log.evtType = :type", { type: evtTypes }).andWhere("POSITION(:keyWords in log.content) >= 1", { keyWords: keyWord }).orderBy("evtDatetime", "DESC").skip(_indexNum).take(_limit).getMany();
                    const _searchData = yield this.orm_repository.createQueryBuilder("log").select().where("log.evtDatetime >= :nowTime", { nowTime: now }).andWhere("log.evtType = :type", { type: evtTypes }).andWhere("POSITION(:keyWords in log.content) >= 1", { keyWords: keyWord }).orderBy("evtDatetime", "DESC").getMany();
                    logCount = _searchData.length;
                }
                else if (evtTypes) {
                    logContent = yield this.orm_repository.createQueryBuilder("log").select().where("log.evtDatetime >= :nowTime", { nowTime: now }).andWhere("log.evtType = :type", { type: evtTypes }).orderBy("evtDatetime", "DESC").skip(_indexNum).take(_limit).getMany();
                    const _searchData = yield this.orm_repository.createQueryBuilder("log").select().where("log.evtDatetime >= :nowTime", { nowTime: now }).andWhere("log.evtType = :type", { type: evtTypes }).orderBy("evtDatetime", "DESC").getMany();
                    logCount = _searchData.length;
                }
                else if (keyWord) {
                    logContent = yield this.orm_repository.createQueryBuilder("log").select().where("log.evtDatetime >= :nowTime", { nowTime: now }).andWhere("POSITION(:keyWords in log.content) >= 1", { keyWords: keyWord }).orderBy("evtDatetime", "DESC").skip(_indexNum).take(_limit).getMany();
                    const _searchData = yield this.orm_repository.createQueryBuilder("log").select().where("log.evtDatetime >= :nowTime", { nowTime: now }).andWhere("POSITION(:keyWords in log.content) >= 1", { keyWords: keyWord }).orderBy("evtDatetime", "DESC").getMany();
                    logCount = _searchData.length;
                }
                else {
                    logContent = yield this.orm_repository.createQueryBuilder("log").select().where("log.evtDatetime >= :nowTime", { nowTime: now }).orderBy("evtDatetime", "DESC").skip(_indexNum).take(_limit).getMany();
                    const _searchData = yield this.orm_repository.createQueryBuilder("log").select().where("log.evtDatetime >= :nowTime", { nowTime: now }).orderBy("evtDatetime", "DESC").getMany();
                    logCount = _searchData.length;
                }
            }
            for (let i = 0, len = logContent.length; i < len; i++) {
                let type_text = '';
                switch (logContent[i].evtType) {
                    case 1:
                        type_text = 'Add User';
                        break;
                    case 2:
                        type_text = 'Add Role';
                        break;
                    case 3:
                        type_text = 'Add DICOM';
                        break;
                    case 4:
                        type_text = 'Add CAD Result';
                        break;
                    case 5:
                        type_text = 'Add DICOM Image';
                        break;
                    case 6:
                        type_text = 'Add Report';
                        break;
                    case 7:
                        type_text = 'Add Variable';
                        break;
                    case 8:
                        type_text = 'change DICOM state';
                        break;
                    case 11:
                        type_text = 'User Auth';
                        break;
                    case 12:
                        type_text = 'User and Role';
                        break;
                    case 21:
                        type_text = 'Add System state log';
                        break;
                    case 91:
                        type_text = 'CAD exception';
                        break;
                }
                logContent[i].evtType = type_text;
            }
            return { logData: logContent, logLength: logCount };
        });
    }
    getLogsSearchPatient(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let now = new Date("1900-01-01");
            let evtTypes = request.query.type;
            let keyWord = request.query.content;
            switch (true) {
                case request.query.time == "last1hour":
                    {
                        now = new Date(new Date().getTime() - 1 * 60 * 60 * 1000);
                    }
                    break;
                case request.query.time == "last1day":
                    {
                        now = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
                    }
                    break;
                case request.query.time == "last7day":
                    {
                        now = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
                    }
                    break;
                case request.query.time == "last30day":
                    {
                        now = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
                    }
                    break;
                default:
                    break;
            }
            let logContent;
            if (evtTypes && keyWord) {
                logContent = yield this.orm_repository.createQueryBuilder("log").select().where("log.evtDatetime >= :nowTime", { nowTime: now }).andWhere("log.evtType = :type", { type: evtTypes }).andWhere("POSITION(:keyWords in log.patientId) >= 1", { keyWords: keyWord }).getMany();
            }
            else if (evtTypes) {
                logContent = yield this.orm_repository.createQueryBuilder("log").select().where("log.evtDatetime >= :nowTime", { nowTime: now }).andWhere("log.evtType = :type", { type: evtTypes }).getMany();
            }
            else if (keyWord) {
                logContent = yield this.orm_repository.createQueryBuilder("log").select().where("log.evtDatetime >= :nowTime", { nowTime: now }).andWhere("POSITION(:keyWords in log.content) >= 1", { keyWords: keyWord }).orderBy("evtDatetime", "DESC").getMany();
            }
            else {
                logContent = yield this.orm_repository.createQueryBuilder("log").select().where("log.evtDatetime >= :nowTime", { nowTime: now }).getMany();
            }
            for (let i = 0, len = logContent.length; i < len; i++) {
                let type_text = '';
                switch (logContent[i].evtType) {
                    case 1:
                        type_text = 'Add User';
                        break;
                    case 2:
                        type_text = 'Add Role';
                        break;
                    case 3:
                        type_text = 'Add DICOM';
                        break;
                    case 4:
                        type_text = 'Add CAD Result';
                        break;
                    case 5:
                        type_text = 'Add DICOM Image';
                        break;
                    case 6:
                        type_text = 'Add Report';
                        break;
                    case 7:
                        type_text = 'Add Variable';
                        break;
                    case 8:
                        type_text = 'change DICOM state';
                        break;
                    case 11:
                        type_text = 'User Auth';
                        break;
                    case 12:
                        type_text = 'User and Role';
                        break;
                    case 21:
                        type_text = 'Add System state log';
                        break;
                    case 91:
                        type_text = 'CAD exception';
                        break;
                }
                logContent[i].evtType = type_text;
            }
            return logContent;
        });
    }
    addLogs(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const req_data = request.body;
            if (!request.body.evtDatetime) {
                const now = new Date(Date.now());
                req_data.evtDatetime = now;
            }
            const result = this.orm_repository.save(req_data);
            return result.then(results => { return results; }).catch(err => { return err; });
        });
    }
}
exports.SysLogController = SysLogController;
