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
const logger = require("../util/logger");
class TourCarController {
    constructor() {
        this.orm_car = (0, typeorm_1.getRepository)(TourCar_1.TourCar);
        this.orm_case = (0, typeorm_1.getRepository)(TourCarCase_1.TourCarCase);
        this.orm_car_mapping = (0, typeorm_1.getRepository)(TourCarMapping_1.TourCarMapping);
        this.orm_Log = (0, typeorm_1.getRepository)(SysLogs_1.SysLog);
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
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        const getTourCarRec = yield _this.orm_car.findOne({ where: { job: _body.job } });
                        if (!getTourCarRec) {
                            reject({ codeStatus: 404, message: `Delete new TourCar Record job: ${_body.job} fail.` });
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
                        const getTourCarCaseRec = yield _this.orm_case.findOne({ where: { caseName: _body.caseName } });
                        if (!getTourCarCaseRec) {
                            const _obj = new TourCarCase_1.TourCarCase();
                            _obj.map_job = param_job;
                            _obj.caseName = _body.caseName;
                            _obj.patientId = _body.patientId;
                            _obj.seriesId = _body.seriesId;
                            _obj.series = _body.series;
                            _obj.upload = _body.upload ? 1 : 0;
                            _obj.status = "Pending";
                            yield _this.saveRecord(TourCarCase_1.TourCarCase, _obj);
                            const getTestMapping = yield _this.orm_car_mapping.findOne({ where: { patientId: _body.patientId } });
                            if (!getTestMapping) {
                                const _mapping = new TourCarMapping_1.TourCarMapping();
                                const testData = _this.testMappingData(_body.caseName);
                                ;
                                _mapping.patientId = _body.patientId;
                                _mapping.accNumbers = testData.accNum.join();
                                _mapping.mapping_data = JSON.stringify(testData);
                                if (testData.accNum.length == 1) {
                                    _obj.mapping = testData.accNum[0];
                                    yield _this.saveRecord(TourCarCase_1.TourCarCase, _obj);
                                }
                                yield _this.saveRecord(TourCarMapping_1.TourCarMapping, _mapping);
                            }
                        }
                        else {
                            reject({ codeStatus: 404, message: `duplicate caseName.` });
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
                            getTourCarCaseResult.mapping = _body.mapping;
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
