import { getRepository, getConnection } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { SysLog } from "../entity/SysLogs";
import { TourCar } from "../entity/TourCar";
import { TourCarCase } from "../entity/TourCarCase";
import { TourCarMapping } from "../entity/TourCarMapping";
// import { rabbit } from "../util/rabbitMQ";
import { DICOMRecords } from "../entity/DICOMRecords";
import { aseutil } from "../util/crypto";
const logger = require("../util/logger");
const _request = require('request');
const config_data = require('../global.json');

export class TourCarController {
    private aseutil = new aseutil();
    // private rabbits = new rabbit();
    private orm_car = getRepository(TourCar);
    private orm_case = getRepository(TourCarCase);
    private orm_car_mapping = getRepository(TourCarMapping);
    private orm_Log = getRepository(SysLog);
    private orm_recs = getRepository(DICOMRecords);

    /** 取得TourCar結果 ([httpget] /tourCar) */
    async getTourCar(request: Request, response: Response, next: NextFunction) {
        const getTourCarResult = await this.orm_car.find();
        return { codeStatus: 200, result: getTourCarResult };
    }

    /** 儲存TourCar資訊 ([httppost] /tourCar) */
    async saveTourCar(request: Request, response: Response, next: NextFunction) {
        const now = new Date(Date.now());
        let _this = this;
        const _body = request.body;
        const LogMessage = {
            evtType: 21,
            evtDatetime: now,
            content: `Add new TourCar Record job: ${_body.job}, ${_body.name}`
        };

        return new Promise<any>(async function (resolve, reject) {
            try {
                const _obj = new TourCar();
                const getTourCarRec = await _this.orm_car.findOne({ where: { job: _body.job } });

                if (!getTourCarRec) {
                    _obj.job = _body.job;
                    _obj.name = _body.name;
                    _obj.series = _body.series;
                    _obj.time = new Date(_body.time);

                    await _this.orm_car.save(_obj);

                    const caseFiles = _body.files;

                    //測試 先模擬如果重複記錄下來 後面用來判定是否直接mapping
                    let duplicates = {};
                    caseFiles.forEach(item => {
                        let _id = item.caseName.split("#")[1];
                        if (!duplicates[_id]?.length) {
                            duplicates[_id] = [];
                            duplicates[_id].push(item.caseName);
                        } else {
                            duplicates[_id].push(item.caseName);
                        }
                    });


                    for (let i = 0; i < caseFiles.length; i++) {
                        const getTourCarCaseRec = await _this.orm_case.findOne({ where: { caseName: caseFiles[i].caseName } });
                        if (!getTourCarCaseRec) {
                            //TODO get His資訊放到Minipacs回傳Dicom，此處用於測試選擇accNumber accNum需要選擇則要status顯示需人工介入
                            const getTestMapping = await _this.orm_case.findOne({ where: { patientId: caseFiles[i]?.patientId } });
                            //身分證號
                            let _id = caseFiles[i].caseName.split("#")[1];
                            //假的accNumber資料產生
                            const testData = _this.testMappingData(_id);;

                            if (!getTestMapping) {
                                const _mapping = new TourCarMapping();
                                _mapping.patientId = caseFiles[i]?.patientId;
                                _mapping.accNumbers = testData.accNum;
                                _mapping.mapping_data = JSON.stringify(testData);

                                await _this.saveRecord(TourCarMapping, _mapping);
                            }

                            const _obj = new TourCarCase();

                            //判斷身分證沒有重複 直接mapping accNumber
                            if (duplicates[_id].length == 1) {
                                _obj.mapping = testData.accNum;
                            }

                            let instancesUUID = "";
                            const series_data = _this.aseutil.sha1Hash(caseFiles[i]?.patientId + "|" + caseFiles[i]?.studyId + "|" + caseFiles[i]?.seriesId + "|" + caseFiles[i]?.instancesId);
                            for (let i = 0; i < 5; i++) {
                                instancesUUID += series_data.substring(i * 8, (i + 1) * 8);
                                if (i !== 4) {
                                    instancesUUID += "-";
                                }
                            }

                            _obj.map_job = _body?.job;
                            _obj.caseName = caseFiles[i]?.caseName;
                            _obj.patientId = caseFiles[i]?.patientId;
                            _obj.studyId = caseFiles[i]?.studyId;
                            _obj.seriesId = caseFiles[i]?.seriesId;
                            _obj.instancesUUId = instancesUUID;
                            _obj.upload = caseFiles[i]?.upload ? 1 : 0;
                            _obj.status = "Pending";

                            await _this.saveRecord(TourCarCase, _obj);
                        }
                    }
                } else {
                    reject({ codeStatus: 404, message: `duplicate job name.` });
                }

                await _this.orm_Log.save(LogMessage);
                resolve({ codeStatus: 200, message: LogMessage.content, result: _obj });
            } catch (err) {
                logger.error(`TourCar Add catch error: ${err}.`);
                LogMessage.content = `Add new TourCar Record fail ErrorMessage ${err}.`;
                await _this.orm_Log.save(LogMessage);
                reject({ codeStatus: 404, message: LogMessage.content });
            }
        });
    }

    /** 刪除TourCar資訊 ([httpdelete] /tourCar) */
    async deleteTourCar(request: Request, response: Response, next: NextFunction) {
        const now = new Date(Date.now());
        let _this = this;
        const _body = request.body;
        const LogMessage = {
            evtType: 21,
            evtDatetime: now,
            content: `Delete new TourCar Record job: ${_body.job}.`
        };

        return new Promise<any>(async function (resolve, reject) {
            try {
                const getTourCarRec = await _this.orm_car.findOne({ where: { job: _body.job } });
                //TODO 刪除Orthanc上的Dicom 先取得UUID
                const findAllCase = await _this.orm_case.find({ where: { map_job: _body.job } });
                const allDeleteUUID = [];
                for (let i = 0; i < findAllCase.length; i++) {
                    let series_result = "";
                    const series_data = _this.aseutil.sha1Hash(findAllCase[i]?.patientId + "|" + findAllCase[i]?.studyId + "|" + findAllCase[i]?.seriesId);
                    for (let i = 0; i < 5; i++) {
                        series_result += series_data.substring(i * 8, (i + 1) * 8);
                        if (i !== 4) {
                            series_result += "-";
                        }
                    }
                    allDeleteUUID.push(series_result);
                }
                //刪除所有case的dicom
                _this.deleteItemsFromOrthanc(allDeleteUUID);

                await _this.orm_case
                    .createQueryBuilder()
                    .delete()
                    .from(TourCarCase)
                    .where("map_job = :mapJob", { mapJob: _body.job })
                    .execute();

                if (!getTourCarRec) {
                    reject({ codeStatus: 404, message: `Delete TourCar Record job: ${_body.job} fail.` });
                } else {
                    await _this.orm_car.remove(getTourCarRec);
                }

                await _this.orm_car_mapping.clear();
                await _this.orm_Log.save(LogMessage);
                resolve({ codeStatus: 200, message: LogMessage.content });
            } catch (err) {
                logger.error(`TourCar Delete catch error: ${err}.`);
                LogMessage.content = `Delete TourCar Record fail ErrorMessage ${err}.`;
                await _this.orm_Log.save(LogMessage);
                reject({ codeStatus: 404, message: LogMessage.content });
            }
        });
    }

    async deleteItemsFromOrthanc(list) {
        for (const item of list) {
            try {
                const DeleteStudy_str = `${config_data?.global?.orthanc_dicom_web_api}/series/${item}`;
                await this.doDeleteRequest(DeleteStudy_str);
                logger.info(`Delete UUID: ${item}`);
            } catch (error) {
                logger.error(`Delete dicom failed UUID: ${item}. errorMessage: ${error}`);
            }
        }
    }

    doDeleteRequest(url): any {
        return new Promise(function (resolve, reject) {
            _request({
                method: 'DELETE',
                uri: url,
                headers: { 'Authorization': 'Basic b3J0aGFuYzpvcnRoYW5j' },
                rejectUnauthorized: false,
                requestCert: false,
                agent: false
            },
                function (error, res, body) {
                    if (!error && res.statusCode == 200) {
                        resolve(body);
                    } else {
                        reject(error);
                    }
                });
        });
    }

    /** 取得getTourCar結果 ([httpget] /tourCarCase/:job) */
    async getTourCarCase(request: Request, response: Response, next: NextFunction) {
        const param_job: any = decodeURIComponent(request.params.job);
        const cases = await this.orm_case
            .createQueryBuilder('case')
            .leftJoinAndSelect(TourCarMapping, 'mapping', 'case.patientId = mapping.patientId')
            .where('case.map_job = :mapJob', { mapJob: param_job })
            .select([
                'case.id AS id',
                'case.map_job AS map_job',
                'case.patientId AS patientId',
                'case.studyId AS studyId',
                'case.seriesId AS seriesId',
                'case.instancesUUId AS instancesUUId',
                'case.caseName AS caseName',
                'case.status AS status',
                'case.upload AS upload',
                'case.mapping AS mapping',
                'case.postAI AS postAI',
                'case.postPACS AS postPACS',
                'mapping.accNumbers AS accNumbers',
            ])
            .getRawMany();

        return { codeStatus: 200, result: cases };
    }

    /** 儲存單一saveTourCarCase資訊 ([httppost] /tourCarCase/:job) */
    async saveTourCarCase(request: Request, response: Response, next: NextFunction) {
        const param_job: any = decodeURIComponent(request.params.job);
        const now = new Date(Date.now());
        let _this = this;
        const _body = request.body;
        const LogMessage = {
            evtType: 21,
            evtDatetime: now,
            content: `Add new TourCarCase Record job: ${param_job},caseName: ${_body.caseName}`
        };

        return new Promise<any>(async function (resolve, reject) {
            try {
                const getTourCarRec = await _this.orm_car.findOne({ where: { job: param_job } });
                const getTourCarCaseRec = await _this.orm_case.findOne({ where: { caseName: _body.caseName } });

                if (getTourCarRec) {
                    if (!getTourCarCaseRec) {

                        //TODO get His資訊放到Minipacs回傳Dicom，此處用於測試選擇accNumber accNum需要選擇則要status顯示需人工介入
                        const getTestMapping = await _this.orm_case.findOne({ where: { patientId: _body.patientId } });
                        //身分證號
                        let _id = _body.caseName.split("#")[1];
                        const testData = _this.testMappingData(_id);
                        let isMapping = false;

                        if (!getTestMapping) {
                            isMapping = true;
                            const _mapping = new TourCarMapping();
                            _mapping.patientId = _body?.patientId;
                            _mapping.accNumbers = testData.accNum;
                            _mapping.mapping_data = JSON.stringify(testData);

                            await _this.saveRecord(TourCarMapping, _mapping);
                        }

                        getTourCarRec.series = getTourCarRec.series + 1;
                        await _this.saveRecord(TourCar, getTourCarRec);

                        let instancesUUID = "";
                        const series_data = _this.aseutil.sha1Hash(_body?.patientId + "|" + _body?.studyId + "|" + _body?.seriesId + "|" + _body?.instancesId);
                        for (let i = 0; i < 5; i++) {
                            instancesUUID += series_data.substring(i * 8, (i + 1) * 8);
                            if (i !== 4) {
                                instancesUUID += "-";
                            }
                        }

                        const _obj = new TourCarCase();
                        if (isMapping) {
                            _obj.mapping = testData.accNum;
                        }

                        _obj.map_job = param_job;
                        _obj.caseName = _body?.caseName;
                        _obj.patientId = _body?.patientId;
                        _obj.studyId = _body?.studyId;
                        _obj.seriesId = _body?.seriesId;
                        _obj.instancesUUId = instancesUUID;
                        _obj.upload = _body?.upload ? 1 : 0;
                        _obj.status = "Pending";

                        await _this.saveRecord(TourCarCase, _obj);
                    } else {
                        reject({ codeStatus: 404, message: `duplicate caseName.` });
                    }
                } else {
                    reject({ codeStatus: 404, message: `Not found this job.` });
                }

                await _this.saveRecord(SysLog, LogMessage);
                resolve({ codeStatus: 200, message: LogMessage.content });
            } catch (err) {
                logger.error(`TourCarCase Add catch error: ${err}.`);
                LogMessage.content = `Add new TourCarCase Record fail ErrorMessage ${err}.`;
                await _this.orm_Log.save(LogMessage);
                reject({ codeStatus: 404, message: LogMessage.content });
            }
        });
    }

    /** 取得getMappingTable結果 ([httpget] /tourCarMapping/:case) */
    async getTourCarCaseMapping(request: Request, response: Response, next: NextFunction) {
        const param_case: any = decodeURIComponent(request.params.job);
        const getTourCarCaseMappingResult = await this.orm_car_mapping.find({ where: { patientId: param_case } });
        return { codeStatus: 200, result: getTourCarCaseMappingResult };
    }

    /** 重新取得資料 ([httppost] /tourCarCase/:case) */
    async reTourCarCaseMapping(request: Request, response: Response, next: NextFunction) {
        const param_case: any = decodeURIComponent(request.params.case);
        const getTourCarCaseRec = await this.orm_case.findOne({ where: { caseName: param_case } });
        const getTourCarCaseMappingResult = await this.orm_car_mapping.findOne({ where: { patientId: getTourCarCaseRec.patientId } });
        const testData = this.testMappingData(param_case);
        getTourCarCaseMappingResult.mapping_data = JSON.stringify(testData);

        await this.orm_car_mapping.save(getTourCarCaseMappingResult);

        return { codeStatus: 200, result: getTourCarCaseMappingResult };
    }

    /** 更新TourCarCase資訊 ([httpput] /tourCarCase) */
    async updateTourCarCase(request: Request, response: Response, next: NextFunction, io) {
        const now = new Date(Date.now());
        let _this = this;
        const _body = request.body;
        const LogMessage = {
            evtType: 21,
            evtDatetime: now,
            content: `Update TourCarCase Record caseName: ${_body.caseName}.`
        };

        return new Promise<any>(async function (resolve, reject) {
            try {
                const getTourCarCaseResult = await _this.orm_case.findOne({ where: { caseName: _body.caseName } });
                if (getTourCarCaseResult) {
                    getTourCarCaseResult.mapping = _body?.mapping;

                    await _this.orm_case.save(getTourCarCaseResult);
                    await _this.orm_Log.save(LogMessage);

                    let s = [
                        "等它跑起來的時候，你努力的結果就會讓更多人看見的",
                        "你藏在程式裡的那些有趣的東西，會一直留在那的",
                        "當你從這裡畢業的時候，只是暫時斷線對吧，下次上線，就是更厲害的倉鼠啦",
                        "那些天馬行空的有趣想法，別丟了他們~  很有趣，有機會偷偷塞一些到你未來作品裡",
                        "到達停損點的時候，就關上電腦休息吧，有新的想法就記錄在你的虛數世界(DC)保存",
                        "從接近零開始到現在完成介面與部分串接，真的已經很棒了，只是缺少時間深入了解",
                        "希望倉鼠能一直帶著好奇的心，探索遊戲和你覺得有趣的事情",
                        "再忙也要給自己留一點時間小小的休息一下",
                        "擁有很多故事的倉鼠，會收集到更多故事的",
                        "幫上了大忙呢! 把巡迴車的功能做的這麼完整，省下我很多事情啦!"
                    ];
                    const _random = Math.floor(Math.random() * 10);

                    io.sendUpdateTourCar(s[_random]);

                    resolve({ codeStatus: 200, message: LogMessage.content, result: getTourCarCaseResult });
                } else {
                    resolve({ codeStatus: 404, message: `Not found this caseName ${_body.caseName}.` });
                }
            } catch (err) {
                logger.error(`TourCarCase update catch error: ${err}.`);
                LogMessage.content = `Update TourCarCase Record fail ErrorMessage ${err}.`;
                await _this.orm_Log.save(LogMessage);
                reject({ codeStatus: 404, message: LogMessage.content });
            }
        });
    }

    /** retry postToPACS ([httppost] /tourCarCase/:case/retryPACS) */
    async retryPACS(request: Request, response: Response, next: NextFunction, io) {
        const now = new Date(Date.now());
        const param_case: any = decodeURIComponent(request.params.case);
        let _this = this;
        const LogMessage = {
            evtType: 21,
            evtDatetime: now,
            content: `Retry post To PACS caseName: ${param_case}.`
        };

        return new Promise<any>(async function (resolve, reject) {
            try {
                const getTourCarCaseResult = await _this.orm_case.findOne({ where: { caseName: param_case } });
                if (getTourCarCaseResult) {
                    getTourCarCaseResult.postPACS = 2; //(0錯誤 1等待 2完成)
                    await _this.orm_case.save(getTourCarCaseResult);
                    await _this.orm_Log.save(LogMessage);

                    let s = [
                        "等它跑起來的時候，你努力的結果就會讓更多人看見的",
                        "你藏在程式裡的那些有趣的東西，會一直留在那的",
                        "當你從這裡畢業的時候，只是暫時斷線對吧，下次上線，就是更厲害的倉鼠啦",
                        "那些天馬行空的有趣想法，別丟了他們~  很有趣，有機會偷偷塞一些到你未來作品裡",
                        "到達停損點的時候，就關上電腦休息吧，有新的想法就記錄在你的虛數世界(DC)保存",
                        "從接近零開始到現在完成介面與部分串接，真的已經很棒了，只是缺少時間深入了解",
                        "希望倉鼠能一直帶著好奇的心，探索遊戲和你覺得有趣的事情",
                        "再忙也要給自己留一點時間小小的休息一下",
                        "擁有很多故事的倉鼠，會收集到更多故事的",
                        "幫上了大忙呢! 把巡迴車的功能做的這麼完整，省下我很多事情啦!"
                    ];
                    const _random = Math.floor(Math.random() * 10);

                    io.sendUpdateTourCar(s[_random]);


                    // getTourCarCaseResult.postPACS = 1; //(0錯誤 1等待 2完成)
                    // await _this.orm_case.save(getTourCarCaseResult);
                    // await _this.orm_Log.save(LogMessage);
                    //通知post to PACS
                    // let MQ_message = {
                    //     "task_type": "send_series_task",        // [功能用] 任務類型，供 MQ consumer 分流使用
                    //     "task_id": "job-20250723-001",          // [記錄用] 任務唯一識別碼，用於追蹤、對應回報與 log
                    //     "caseName": getTourCarCaseResult.caseName, // [功能用] 哪一筆Case資料，對應後續查詢
                    //     "series_uid": getTourCarCaseResult.seriesId,        // [功能用] 欲傳送的 DICOM 影像所屬 Series UID，是主要處理目標
                    //     "target_aets": ["PACS_A", "AI_NODE"],   // [功能用] 傳送目標 AET 清單，minipacs 需逐一傳送
                    //     "timestamp": now     // [記錄用] 任務建立時間，方便審計與處理順序判斷
                    // };

                    // this.rabbits.connecting("xray-UPLOAD", MQ_message, 0);

                    resolve({ codeStatus: 200, message: LogMessage.content, result: getTourCarCaseResult });
                } else {
                    resolve({ codeStatus: 404, message: `Not found this caseName ${param_case}.` });
                }
            } catch (err) {
                logger.error(`TourCarCase:${param_case} retry post To PACS catch error: ${err}.`);
                LogMessage.content = `TourCarCase:${param_case} retry post To PACS fail ErrorMessage ${err}.`;
                await _this.orm_Log.save(LogMessage);
                reject({ codeStatus: 404, message: LogMessage.content });
            }
        });
    }

    /** retry AI ([httppost] /tourCarCase/:case/retryAI) */
    async retryAI(request: Request, response: Response, next: NextFunction, io) {
        const now = new Date(Date.now());
        const param_case: any = decodeURIComponent(request.params.case);
        let _this = this;
        const LogMessage = {
            evtType: 21,
            evtDatetime: now,
            content: `Retry AI caseName: ${param_case}.`
        };

        return new Promise<any>(async function (resolve, reject) {
            try {
                const getTourCarCaseResult = await _this.orm_case.findOne({ where: { caseName: param_case } });
                if (getTourCarCaseResult) {
                    getTourCarCaseResult.postAI = 2; //(0錯誤 1等待 2完成)
                    await _this.orm_case.save(getTourCarCaseResult);
                    await _this.orm_Log.save(LogMessage);

                    let s = [
                        "等它跑起來的時候，你努力的結果就會讓更多人看見的",
                        "你藏在程式裡的那些有趣的東西，會一直留在那的",
                        "當你從這裡畢業的時候，只是暫時斷線對吧，下次上線，就是更厲害的倉鼠啦",
                        "那些天馬行空的有趣想法，別丟了他們~  很有趣，有機會偷偷塞一些到你未來作品裡",
                        "到達停損點的時候，就關上電腦休息吧，有新的想法就記錄在你的虛數世界(DC)保存",
                        "從接近零開始到現在完成介面與部分串接，真的已經很棒了，只是缺少時間深入了解",
                        "希望倉鼠能一直帶著好奇的心，探索遊戲和你覺得有趣的事情",
                        "再忙也要給自己留一點時間小小的休息一下",
                        "擁有很多故事的倉鼠，會收集到更多故事的",
                        "幫上了大忙呢! 把巡迴車的功能做的這麼完整，省下我很多事情啦!"
                    ];
                    const _random = Math.floor(Math.random() * 10);

                    io.sendUpdateTourCar(s[_random]);


                    //TODO AI post

                    resolve({ codeStatus: 200, message: LogMessage.content, result: getTourCarCaseResult });
                } else {
                    resolve({ codeStatus: 404, message: `Not found this caseName ${param_case}.` });
                }
            } catch (err) {
                logger.error(`TourCarCase:${param_case} retry AI catch error: ${err}.`);
                LogMessage.content = `TourCarCase:${param_case} retry AI fail ErrorMessage ${err}.`;
                await _this.orm_Log.save(LogMessage);
                reject({ codeStatus: 404, message: LogMessage.content });
            }
        });
    }

    /** 收到Orthanc合併回應 ([httppost] /xray/mergeAccessionResult) */
    async updateAccnumberAndCaseStatus(request: Request, response: Response, next: NextFunction) {
        const now = new Date(Date.now());
        let _this = this;
        const _body = request.body;
        const LogMessage = {
            evtType: 21,
            evtDatetime: now,
            content: `Orthanc Combind accessNumber result.`
        };

        return new Promise<any>(async function (resolve, reject) {
            try {
                const getTourCarCaseResult = await _this.orm_case.findOne({ where: { seriesId: _body.series_uid } });
                const getDicomrecs = await _this.orm_recs.findOne({ where: { seriesId: _body.series_uid } });
                LogMessage.content = _body.message;
                LogMessage.evtDatetime = _body.timestamp;

                if (getTourCarCaseResult) {
                    getTourCarCaseResult.mapping = _body.accession_number;
                    getDicomrecs.accNum = _body.accession_number;

                    getTourCarCaseResult.status = _body.status == "success" ? 'Success' : 'Fail';

                    //更新資料
                    await _this.orm_case.save(getTourCarCaseResult);
                    await _this.orm_recs.save(getDicomrecs);
                    await _this.orm_Log.save(LogMessage);


                    //通知post to PACS
                    let MQ_message = {
                        "task_type": "send_series_task",        // [功能用] 任務類型，供 MQ consumer 分流使用
                        "task_id": "job-20250723-001",          // [記錄用] 任務唯一識別碼，用於追蹤、對應回報與 log
                        "caseName": getTourCarCaseResult.caseName, // [功能用] 哪一筆Case資料，對應後續查詢
                        "series_uid": getTourCarCaseResult.seriesId,        // [功能用] 欲傳送的 DICOM 影像所屬 Series UID，是主要處理目標
                        "target_aets": ["PACS_A", "AI_NODE"],   // [功能用] 傳送目標 AET 清單，minipacs 需逐一傳送
                        "timestamp": now     // [記錄用] 任務建立時間，方便審計與處理順序判斷
                    };

                    this.rabbits.connecting("xray-UPLOAD", MQ_message, 0);

                    resolve({ codeStatus: 200, message: LogMessage.content, result: getTourCarCaseResult });
                } else {
                    resolve({ codeStatus: 404, message: `Not found this case seriesID: ${_body.series_uid}.` });
                }
            } catch (err) {
                logger.error(`Orthanc Combind accessNumber result catch error: ${err}.`);
                LogMessage.content = `Orthanc Combind accessNumber result, update TourCarCase Record fail ErrorMessage ${err}.`;
                await _this.orm_Log.save(LogMessage);
                reject({ codeStatus: 404, message: LogMessage.content });
            }
        });
    }

    /** 收到Orthanc 傳送PACS成功後呼叫 ([httppost] /xray/sendPACSResult) */
    async receiveOrthancPostToPACSResult(request: Request, response: Response, next: NextFunction) {
        const now = new Date(Date.now());
        let _this = this;
        const _body = request.body;
        const LogMessage = {
            evtType: 21,
            evtDatetime: now,
            content: `Orthanc Combind accessNumber result.`
        };

        return new Promise<any>(async function (resolve, reject) {
            try {
                const getTourCarCaseResult = await _this.orm_case.findOne({ where: { seriesId: _body.series_uid } });
                LogMessage.content = _body.message;
                LogMessage.evtDatetime = _body.timestamp;

                if (getTourCarCaseResult) {
                    getTourCarCaseResult.postPACS = _body.status == "success" ? 1 : 0;

                    //TODO 送出API
                    // const request_data = {};
                    // const options = {
                    //     'method': "POST",
                    //     'url': "aiInference?.url",
                    //     'headers': {
                    //         'Content-Type': 'application/json; charset=utf-8'
                    //     },
                    //     body: JSON.stringify(request_data)
                    // };

                    // _request(options, async function (error, response) {
                    //     if (error) {
                    //         logger.error(`Post to standalone_server ${aiInference?.url} error: ${error}`);
                    //         getTourCarCaseResult.postAI = 0;
                    //     } else {
                    //         logger.info(`Post to standalone_server ${aiInference?.url} successful.`);
                    //         //更新資料
                    //         getTourCarCaseResult.postAI = 1;
                    //     }
                    //     await _this.orm_case.save(getTourCarCaseResult);
                    // });

                    resolve({ codeStatus: 200, message: LogMessage.content, result: getTourCarCaseResult });
                } else {
                    resolve({ codeStatus: 404, message: `Not found this case seriesID: ${_body.series_uid}.` });
                }
            } catch (err) {
                logger.error(`Orthanc postToPACS receive result catch error: ${err}.`);
                LogMessage.content = `Orthanc postToPACS receive result, update TourCarCase Record fail ErrorMessage ${err}.`;
                await _this.orm_Log.save(LogMessage);
                reject({ codeStatus: 404, message: LogMessage.content });
            }
        });
    }

    testMappingData(caseName) {
        let _random = Math.floor(Math.random() * 3);
        const MapAI = ["No", "Test", "GO"];
        const MapAccNum = [`Apple_${caseName}`, `Test_${caseName}`, `News_${caseName}`];
        const accNum = MapAccNum[_random];
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

    async saveRecord(entity, record) {
        const connection = getConnection("default");
        const queryRunner = connection.createQueryRunner();

        // 確保 QueryRunner 能夠連線
        await queryRunner.connect();

        // 開始事務
        await queryRunner.startTransaction();

        try {
            await queryRunner.manager.save(entity, record);
            await queryRunner.commitTransaction();
        } catch (error) {
            console.error(`${entity} Transaction failed. Rolling back: `, error);
            // 如果出錯，回滾事務
            await queryRunner.rollbackTransaction();
        } finally {
            // 釋放 query runner
            await queryRunner.release();
        }
    }
}