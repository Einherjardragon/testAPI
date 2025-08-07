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
exports.TourCarController = void 0;
const typeorm_1 = require("typeorm");
const SysLogs_1 = require("../entity/SysLogs");
const TourCar_1 = require("../entity/TourCar");
const TourCarCase_1 = require("../entity/TourCarCase");
const TourCarMapping_1 = require("../entity/TourCarMapping");
const DICOMRecords_1 = require("../entity/DICOMRecords");
const crypto_1 = require("../util/crypto");
const logger = require("../util/logger");
const _request = require('request');
const config_data = require('../global.json');
class TourCarController {
    constructor() {
        this.aseutil = new crypto_1.aseutil();
        this.orm_car = (0, typeorm_1.getRepository)(TourCar_1.TourCar);
        this.orm_case = (0, typeorm_1.getRepository)(TourCarCase_1.TourCarCase);
        this.orm_car_mapping = (0, typeorm_1.getRepository)(TourCarMapping_1.TourCarMapping);
        this.orm_Log = (0, typeorm_1.getRepository)(SysLogs_1.SysLog);
        this.orm_recs = (0, typeorm_1.getRepository)(DICOMRecords_1.DICOMRecords);
    }
    getTourCar(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const getTourCarResult = yield this.orm_car.find();
            return { codeStatus: 200, result: getTourCarResult };
        });
    }
    saveTourCar(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date(Date.now());
            let _this = this;
            const _body = request.body;
            const LogMessage = {
                evtType: 21,
                evtDatetime: now,
                content: `Add new TourCar Record job: ${_body.job}, ${_body.name}`
            };
            return new Promise(function (resolve, reject) {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        const _obj = new TourCar_1.TourCar();
                        const getTourCarRec = yield _this.orm_car.findOne({ where: { job: _body.job } });
                        if (!getTourCarRec) {
                            _obj.job = _body.job;
                            _obj.name = _body.name;
                            _obj.series = _body.series;
                            _obj.time = new Date(_body.time);
                            yield _this.orm_car.save(_obj);
                            const caseFiles = _body.files;
                            for (let i = 0; i < caseFiles.length; i++) {
                                const getTourCarCaseRec = yield _this.orm_case.findOne({ where: { caseName: caseFiles[i].caseName } });
                                if (!getTourCarCaseRec) {
                                    let instancesUUID = "";
                                    const series_data = _this.aseutil.sha1Hash(((_a = caseFiles[i]) === null || _a === void 0 ? void 0 : _a.patientId) + "|" + ((_b = caseFiles[i]) === null || _b === void 0 ? void 0 : _b.studyId) + "|" + ((_c = caseFiles[i]) === null || _c === void 0 ? void 0 : _c.seriesId) + "|" + ((_d = caseFiles[i]) === null || _d === void 0 ? void 0 : _d.instancesId));
                                    for (let i = 0; i < 5; i++) {
                                        instancesUUID += series_data.substring(i * 8, (i + 1) * 8);
                                        if (i !== 4) {
                                            instancesUUID += "-";
                                        }
                                    }
                                    const _obj = new TourCarCase_1.TourCarCase();
                                    _obj.map_job = _body === null || _body === void 0 ? void 0 : _body.job;
                                    _obj.caseName = (_e = caseFiles[i]) === null || _e === void 0 ? void 0 : _e.caseName;
                                    _obj.patientId = (_f = caseFiles[i]) === null || _f === void 0 ? void 0 : _f.patientId;
                                    _obj.studyId = (_g = caseFiles[i]) === null || _g === void 0 ? void 0 : _g.studyId;
                                    _obj.seriesId = (_h = caseFiles[i]) === null || _h === void 0 ? void 0 : _h.seriesId;
                                    _obj.instancesUUId = instancesUUID;
                                    _obj.series = _body === null || _body === void 0 ? void 0 : _body.series;
                                    _obj.upload = ((_j = caseFiles[i]) === null || _j === void 0 ? void 0 : _j.upload) ? 1 : 0;
                                    _obj.status = "Pending";
                                    yield _this.saveRecord(TourCarCase_1.TourCarCase, _obj);
                                    const getTestMapping = yield _this.orm_case.findOne({ where: { patientId: _body.patientId } });
                                    if (!getTestMapping) {
                                        const _mapping = new TourCarMapping_1.TourCarMapping();
                                        const testData = _this.testMappingData(caseFiles[i].caseName);
                                        ;
                                        _mapping.patientId = _body.patientId;
                                        _mapping.accNumbers = testData.accNum.join();
                                        _mapping.mapping_data = JSON.stringify(testData);
                                        yield _this.saveRecord(TourCarMapping_1.TourCarMapping, _mapping);
                                    }
                                }
                            }
                        }
                        else {
                            reject({ codeStatus: 404, message: `duplicate job name.` });
                        }
                        yield _this.orm_Log.save(LogMessage);
                        resolve({ codeStatus: 200, message: LogMessage.content, result: _obj });
                    }
                    catch (err) {
                        logger.error(`TourCar Add catch error: ${err}.`);
                        LogMessage.content = `Add new TourCar Record fail ErrorMessage ${err}.`;
                        yield _this.orm_Log.save(LogMessage);
                        reject({ codeStatus: 404, message: LogMessage.content });
                    }
                });
            });
        });
    }
    deleteTourCar(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date(Date.now());
            let _this = this;
            const _body = request.body;
            const LogMessage = {
                evtType: 21,
                evtDatetime: now,
                content: `Delete new TourCar Record job: ${_body.job}.`
            };
            return new Promise(function (resolve, reject) {
                var _a, _b, _c;
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        const getTourCarRec = yield _this.orm_car.findOne({ where: { job: _body.job } });
                        const findAllCase = yield _this.orm_case.find({ where: { map_job: _body.job } });
                        const allDeleteUUID = [];
                        for (let i = 0; i < findAllCase.length; i++) {
                            let series_result = "";
                            const series_data = _this.aseutil.sha1Hash(((_a = findAllCase[i]) === null || _a === void 0 ? void 0 : _a.patientId) + "|" + ((_b = findAllCase[i]) === null || _b === void 0 ? void 0 : _b.studyId) + "|" + ((_c = findAllCase[i]) === null || _c === void 0 ? void 0 : _c.seriesId));
                            for (let i = 0; i < 5; i++) {
                                series_result += series_data.substring(i * 8, (i + 1) * 8);
                                if (i !== 4) {
                                    series_result += "-";
                                }
                            }
                            allDeleteUUID.push(series_result);
                        }
                        _this.deleteItemsFromOrthanc(allDeleteUUID);
                        yield _this.orm_case
                            .createQueryBuilder()
                            .delete()
                            .from(TourCarCase_1.TourCarCase)
                            .where("map_job = :mapJob", { mapJob: _body.job })
                            .execute();
                        if (!getTourCarRec) {
                            reject({ codeStatus: 404, message: `Delete TourCar Record job: ${_body.job} fail.` });
                        }
                        else {
                            yield _this.orm_car.remove(getTourCarRec);
                        }
                        yield _this.orm_Log.save(LogMessage);
                        resolve({ codeStatus: 200, message: LogMessage.content });
                    }
                    catch (err) {
                        logger.error(`TourCar Delete catch error: ${err}.`);
                        LogMessage.content = `Delete TourCar Record fail ErrorMessage ${err}.`;
                        yield _this.orm_Log.save(LogMessage);
                        reject({ codeStatus: 404, message: LogMessage.content });
                    }
                });
            });
        });
    }
    deleteItemsFromOrthanc(list) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            for (const item of list) {
                try {
                    const DeleteStudy_str = `${(_a = config_data === null || config_data === void 0 ? void 0 : config_data.global) === null || _a === void 0 ? void 0 : _a.orthanc_dicom_web_api}/series/${item}`;
                    yield this.doDeleteRequest(DeleteStudy_str);
                    logger.info(`Delete UUID: ${item}`);
                }
                catch (error) {
                    logger.error(`Delete dicom failed UUID: ${item}. errorMessage: ${error.message}`);
                }
            }
        });
    }
    doDeleteRequest(url) {
        return new Promise(function (resolve, reject) {
            _request({
                method: 'DELETE',
                uri: url,
                headers: { 'Authorization': 'Basic ZG9ua2V5OnBvaXV5dHJld3E=' },
                rejectUnauthorized: false,
                requestCert: false,
                agent: false
            }, function (error, res, body) {
                if (!error && res.statusCode == 200) {
                    resolve(body);
                }
                else {
                    reject(error);
                }
            });
        });
    }
    getTourCarCase(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const param_job = decodeURIComponent(request.params.job);
            const cases = yield this.orm_case
                .createQueryBuilder('case')
                .leftJoinAndSelect(TourCarMapping_1.TourCarMapping, 'mapping', 'case.patientId = mapping.patientId')
                .where('case.map_job = :mapJob', { mapJob: param_job })
                .select([
                'case.id AS id',
                'case.map_job AS map_job',
                'case.patientId AS patientId',
                'case.studyId AS studyId',
                'case.seriesId AS seriesId',
                'case.instancesUUId AS instancesUUId',
                'case.caseName AS caseName',
                'case.series AS series',
                'case.status AS status',
                'case.upload AS upload',
                'case.mapping AS mapping',
                'case.postAI AS postAI',
                'case.postPACS AS postPACS',
                'mapping.accNumbers AS accNumbers',
            ])
                .getRawMany();
            return { codeStatus: 200, result: cases };
        });
    }
    saveTourCarCase(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const param_job = decodeURIComponent(request.params.job);
            const now = new Date(Date.now());
            let _this = this;
            const _body = request.body;
            const LogMessage = {
                evtType: 21,
                evtDatetime: now,
                content: `Add new TourCarCase Record job: ${param_job},caseName: ${_body.caseName}`
            };
            return new Promise(function (resolve, reject) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        const getTourCarRec = yield _this.orm_car.findOne({ where: { job: param_job } });
                        const getTourCarCaseRec = yield _this.orm_case.findOne({ where: { caseName: _body.caseName } });
                        if (getTourCarRec) {
                            if (!getTourCarCaseRec) {
                                const _obj = new TourCarCase_1.TourCarCase();
                                _obj.map_job = param_job;
                                _obj.caseName = _body === null || _body === void 0 ? void 0 : _body.caseName;
                                _obj.patientId = _body === null || _body === void 0 ? void 0 : _body.patientId;
                                _obj.studyId = _body === null || _body === void 0 ? void 0 : _body.studyId;
                                _obj.seriesId = _body === null || _body === void 0 ? void 0 : _body.seriesId;
                                _obj.series = _body === null || _body === void 0 ? void 0 : _body.series;
                                _obj.upload = (_body === null || _body === void 0 ? void 0 : _body.upload) ? 1 : 0;
                                _obj.status = "Pending";
                                yield _this.saveRecord(TourCarCase_1.TourCarCase, _obj);
                                const getTestMapping = yield _this.orm_case.findOne({ where: { patientId: _body.patientId } });
                                if (!getTestMapping) {
                                    const _mapping = new TourCarMapping_1.TourCarMapping();
                                    const testData = _this.testMappingData(_body.caseName);
                                    ;
                                    _mapping.patientId = _body === null || _body === void 0 ? void 0 : _body.patientId;
                                    _mapping.accNumbers = testData.accNum.join();
                                    _mapping.mapping_data = JSON.stringify(testData);
                                    yield _this.saveRecord(TourCarMapping_1.TourCarMapping, _mapping);
                                }
                            }
                            else {
                                reject({ codeStatus: 404, message: `duplicate caseName.` });
                            }
                        }
                        else {
                            reject({ codeStatus: 404, message: `Not found this job.` });
                        }
                        yield _this.saveRecord(SysLogs_1.SysLog, LogMessage);
                        resolve({ codeStatus: 200, message: LogMessage.content });
                    }
                    catch (err) {
                        logger.error(`TourCarCase Add catch error: ${err}.`);
                        LogMessage.content = `Add new TourCarCase Record fail ErrorMessage ${err}.`;
                        yield _this.orm_Log.save(LogMessage);
                        reject({ codeStatus: 404, message: LogMessage.content });
                    }
                });
            });
        });
    }
    getTourCarCaseMapping(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const param_case = decodeURIComponent(request.params.job);
            const getTourCarCaseMappingResult = yield this.orm_car_mapping.find({ where: { patientId: param_case } });
            return { codeStatus: 200, result: getTourCarCaseMappingResult };
        });
    }
    reTourCarCaseMapping(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const param_case = decodeURIComponent(request.params.case);
            const getTourCarCaseRec = yield this.orm_case.findOne({ where: { caseName: param_case } });
            const getTourCarCaseMappingResult = yield this.orm_car_mapping.findOne({ where: { patientId: getTourCarCaseRec.patientId } });
            const testData = this.testMappingData(param_case);
            getTourCarCaseMappingResult.mapping_data = JSON.stringify(testData);
            yield this.orm_car_mapping.save(getTourCarCaseMappingResult);
            return { codeStatus: 200, result: getTourCarCaseMappingResult };
        });
    }
    updateTourCarCase(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date(Date.now());
            let _this = this;
            const _body = request.body;
            const LogMessage = {
                evtType: 21,
                evtDatetime: now,
                content: `Update TourCarCase Record caseName: ${_body.caseName}.`
            };
            return new Promise(function (resolve, reject) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        const getTourCarCaseResult = yield _this.orm_case.findOne({ where: { caseName: _body.caseName } });
                        if (getTourCarCaseResult) {
                            getTourCarCaseResult.mapping = _body === null || _body === void 0 ? void 0 : _body.mapping;
                            yield _this.orm_case.save(getTourCarCaseResult);
                            yield _this.orm_Log.save(LogMessage);
                            resolve({ codeStatus: 200, message: LogMessage.content, result: getTourCarCaseResult });
                        }
                        else {
                            resolve({ codeStatus: 404, message: `Not found this caseName ${_body.caseName}.` });
                        }
                    }
                    catch (err) {
                        logger.error(`TourCarCase update catch error: ${err}.`);
                        LogMessage.content = `Update TourCarCase Record fail ErrorMessage ${err}.`;
                        yield _this.orm_Log.save(LogMessage);
                        reject({ codeStatus: 404, message: LogMessage.content });
                    }
                });
            });
        });
    }
    retryPACS(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date(Date.now());
            const param_case = decodeURIComponent(request.params.case);
            let _this = this;
            const LogMessage = {
                evtType: 21,
                evtDatetime: now,
                content: `Retry post To PACS caseName: ${param_case}.`
            };
            return new Promise(function (resolve, reject) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        const getTourCarCaseResult = yield _this.orm_case.findOne({ where: { caseName: param_case } });
                        if (getTourCarCaseResult) {
                            getTourCarCaseResult.postPACS = 2;
                            yield _this.orm_case.save(getTourCarCaseResult);
                            yield _this.orm_Log.save(LogMessage);
                            resolve({ codeStatus: 200, message: LogMessage.content, result: getTourCarCaseResult });
                        }
                        else {
                            resolve({ codeStatus: 404, message: `Not found this caseName ${param_case}.` });
                        }
                    }
                    catch (err) {
                        logger.error(`TourCarCase:${param_case} retry post To PACS catch error: ${err}.`);
                        LogMessage.content = `TourCarCase:${param_case} retry post To PACS fail ErrorMessage ${err}.`;
                        yield _this.orm_Log.save(LogMessage);
                        reject({ codeStatus: 404, message: LogMessage.content });
                    }
                });
            });
        });
    }
    retryAI(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date(Date.now());
            const param_case = decodeURIComponent(request.params.case);
            let _this = this;
            const LogMessage = {
                evtType: 21,
                evtDatetime: now,
                content: `Retry AI caseName: ${param_case}.`
            };
            return new Promise(function (resolve, reject) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        const getTourCarCaseResult = yield _this.orm_case.findOne({ where: { caseName: param_case } });
                        if (getTourCarCaseResult) {
                            getTourCarCaseResult.postAI = 2;
                            yield _this.orm_case.save(getTourCarCaseResult);
                            yield _this.orm_Log.save(LogMessage);
                            resolve({ codeStatus: 200, message: LogMessage.content, result: getTourCarCaseResult });
                        }
                        else {
                            resolve({ codeStatus: 404, message: `Not found this caseName ${param_case}.` });
                        }
                    }
                    catch (err) {
                        logger.error(`TourCarCase:${param_case} retry AI catch error: ${err}.`);
                        LogMessage.content = `TourCarCase:${param_case} retry AI fail ErrorMessage ${err}.`;
                        yield _this.orm_Log.save(LogMessage);
                        reject({ codeStatus: 404, message: LogMessage.content });
                    }
                });
            });
        });
    }
    updateAccnumberAndCaseStatus(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date(Date.now());
            let _this = this;
            const _body = request.body;
            const LogMessage = {
                evtType: 21,
                evtDatetime: now,
                content: `Orthanc Combind accessNumber result.`
            };
            return new Promise(function (resolve, reject) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        const getTourCarCaseResult = yield _this.orm_case.findOne({ where: { seriesId: _body.series_uid } });
                        const getDicomrecs = yield _this.orm_recs.findOne({ where: { seriesId: _body.series_uid } });
                        LogMessage.content = _body.message;
                        LogMessage.evtDatetime = _body.timestamp;
                        if (getTourCarCaseResult) {
                            getTourCarCaseResult.mapping = _body.accession_number;
                            getDicomrecs.accNum = _body.accession_number;
                            getTourCarCaseResult.status = _body.status == "success" ? 'Success' : 'Fail';
                            yield _this.orm_case.save(getTourCarCaseResult);
                            yield _this.orm_recs.save(getDicomrecs);
                            yield _this.orm_Log.save(LogMessage);
                            let MQ_message = {
                                "task_type": "send_series_task",
                                "task_id": "job-20250723-001",
                                "caseName": getTourCarCaseResult.caseName,
                                "series_uid": getTourCarCaseResult.seriesId,
                                "target_aets": ["PACS_A", "AI_NODE"],
                                "timestamp": now
                            };
                            this.rabbits.connecting("xray-UPLOAD", MQ_message, 0);
                            resolve({ codeStatus: 200, message: LogMessage.content, result: getTourCarCaseResult });
                        }
                        else {
                            resolve({ codeStatus: 404, message: `Not found this case seriesID: ${_body.series_uid}.` });
                        }
                    }
                    catch (err) {
                        logger.error(`Orthanc Combind accessNumber result catch error: ${err}.`);
                        LogMessage.content = `Orthanc Combind accessNumber result, update TourCarCase Record fail ErrorMessage ${err}.`;
                        yield _this.orm_Log.save(LogMessage);
                        reject({ codeStatus: 404, message: LogMessage.content });
                    }
                });
            });
        });
    }
    receiveOrthancPostToPACSResult(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date(Date.now());
            let _this = this;
            const _body = request.body;
            const LogMessage = {
                evtType: 21,
                evtDatetime: now,
                content: `Orthanc Combind accessNumber result.`
            };
            return new Promise(function (resolve, reject) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        const getTourCarCaseResult = yield _this.orm_case.findOne({ where: { seriesId: _body.series_uid } });
                        LogMessage.content = _body.message;
                        LogMessage.evtDatetime = _body.timestamp;
                        if (getTourCarCaseResult) {
                            getTourCarCaseResult.postPACS = _body.status == "success" ? 1 : 0;
                            resolve({ codeStatus: 200, message: LogMessage.content, result: getTourCarCaseResult });
                        }
                        else {
                            resolve({ codeStatus: 404, message: `Not found this case seriesID: ${_body.series_uid}.` });
                        }
                    }
                    catch (err) {
                        logger.error(`Orthanc postToPACS receive result catch error: ${err}.`);
                        LogMessage.content = `Orthanc postToPACS receive result, update TourCarCase Record fail ErrorMessage ${err}.`;
                        yield _this.orm_Log.save(LogMessage);
                        reject({ codeStatus: 404, message: LogMessage.content });
                    }
                });
            });
        });
    }
    testMappingData(caseName) {
        let _random = Math.floor(Math.random() * 3);
        const MapAI = ["No", "Test", "GO"];
        const MapAccNum = [`Apple_${caseName}`, `Test_${caseName}`, `News_${caseName}`];
        const accNum = MapAccNum.slice(_random);
        let testData = {
            caseName,
            accNum: accNum,
            mapping: {}
        };
        for (let i = 0; i < accNum.length; i++) {
            testData.mapping[accNum[i]] = { postAI: MapAI, postPACS: ["test1", "test2"] };
        }
        return testData;
    }
    saveRecord(entity, record) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = (0, typeorm_1.getConnection)("default");
            const queryRunner = connection.createQueryRunner();
            yield queryRunner.connect();
            yield queryRunner.startTransaction();
            try {
                yield queryRunner.manager.save(entity, record);
                yield queryRunner.commitTransaction();
            }
            catch (error) {
                console.error(`${entity} Transaction failed. Rolling back: `, error);
                yield queryRunner.rollbackTransaction();
            }
            finally {
                yield queryRunner.release();
            }
        });
    }
}
exports.TourCarController = TourCarController;
