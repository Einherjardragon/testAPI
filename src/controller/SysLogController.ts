import { createQueryBuilder, getRepository } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { SysLog } from "../entity/SysLogs";

export class SysLogController {

    private orm_repository = getRepository(SysLog);

    /** 取得'query'條件的相關參數 ([httpget] /System/getSearchLog?time) */
    async getLogsSearch(request: Request, response: Response, next: NextFunction) {
        let now = new Date("1900-01-01");
        let evtTypes = request.query.type; //request.query.content
        let keyWord = request.query.content;
        let _timeFilter = request.query.time;
        const _page = Number(request.query.page) || 0;
        const _limit = Number(request.query.limits) || 10;
        //從哪裡開始取多少數量
        const _indexNum = _page ? _page * _limit : 0;
        const _export = request.query?.export;

        switch (true) {
            case _timeFilter == "last1hour": {
                now = new Date(new Date().getTime() - 1 * 60 * 60 * 1000);
            } break;
            case _timeFilter == "last1day": {
                now = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
            } break;
            case _timeFilter == "last7day": {
                now = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
            } break;
            case _timeFilter == "last30day": {
                now = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
            } break;
            default:
                now;
                break;
        }

        let logContent;
        let logCount = 0;//logCount 總數量
        if (!_timeFilter) {
            logCount = await this.orm_repository.count();
        }

        //確認是不是csv輸出 是的話取回全部data
        if (_export) {
            logContent = await this.orm_repository.createQueryBuilder("log").select().orderBy("evtDatetime", "DESC").getMany();
        } else {
            if (evtTypes && keyWord) {
                logContent = await this.orm_repository.createQueryBuilder("log").select().where("log.evtDatetime >= :nowTime", { nowTime: now }).andWhere("log.evtType = :type", { type: evtTypes }).andWhere("POSITION(:keyWords in log.content) >= 1", { keyWords: keyWord }).orderBy("evtDatetime", "DESC").skip(_indexNum).take(_limit).getMany();
                const _searchData = await this.orm_repository.createQueryBuilder("log").select().where("log.evtDatetime >= :nowTime", { nowTime: now }).andWhere("log.evtType = :type", { type: evtTypes }).andWhere("POSITION(:keyWords in log.content) >= 1", { keyWords: keyWord }).orderBy("evtDatetime", "DESC").getMany();
                logCount = _searchData.length;
            } else if (evtTypes) {
                logContent = await this.orm_repository.createQueryBuilder("log").select().where("log.evtDatetime >= :nowTime", { nowTime: now }).andWhere("log.evtType = :type", { type: evtTypes }).orderBy("evtDatetime", "DESC").skip(_indexNum).take(_limit).getMany();
                const _searchData = await this.orm_repository.createQueryBuilder("log").select().where("log.evtDatetime >= :nowTime", { nowTime: now }).andWhere("log.evtType = :type", { type: evtTypes }).orderBy("evtDatetime", "DESC").getMany();
                logCount = _searchData.length;
            } else if (keyWord) {
                logContent = await this.orm_repository.createQueryBuilder("log").select().where("log.evtDatetime >= :nowTime", { nowTime: now }).andWhere("POSITION(:keyWords in log.content) >= 1", { keyWords: keyWord }).orderBy("evtDatetime", "DESC").skip(_indexNum).take(_limit).getMany();
                const _searchData = await this.orm_repository.createQueryBuilder("log").select().where("log.evtDatetime >= :nowTime", { nowTime: now }).andWhere("POSITION(:keyWords in log.content) >= 1", { keyWords: keyWord }).orderBy("evtDatetime", "DESC").getMany();
                logCount = _searchData.length;
            } else {
                logContent = await this.orm_repository.createQueryBuilder("log").select().where("log.evtDatetime >= :nowTime", { nowTime: now }).orderBy("evtDatetime", "DESC").skip(_indexNum).take(_limit).getMany();
                const _searchData = await this.orm_repository.createQueryBuilder("log").select().where("log.evtDatetime >= :nowTime", { nowTime: now }).orderBy("evtDatetime", "DESC").getMany();
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
        // return this.orm_repository.find({ where: { subject: request.params.subject } });
    }

    /** 取得Patient'query'條件的相關參數 ([httpget] /System/getSearchLog?time) */
    async getLogsSearchPatient(request: Request, response: Response, next: NextFunction) {
        let now = new Date("1900-01-01");
        let evtTypes = request.query.type; //request.query.content
        let keyWord = request.query.content;
        switch (true) {
            case request.query.time == "last1hour": {
                now = new Date(new Date().getTime() - 1 * 60 * 60 * 1000);
            } break;
            case request.query.time == "last1day": {
                now = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
            } break;
            case request.query.time == "last7day": {
                now = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
            } break;
            case request.query.time == "last30day": {
                now = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
            } break;
            default:
                break;
        }

        let logContent;
        if (evtTypes && keyWord) {
            logContent = await this.orm_repository.createQueryBuilder("log").select().where("log.evtDatetime >= :nowTime", { nowTime: now }).andWhere("log.evtType = :type", { type: evtTypes }).andWhere("POSITION(:keyWords in log.patientId) >= 1", { keyWords: keyWord }).getMany();
        } else if (evtTypes) {
            logContent = await this.orm_repository.createQueryBuilder("log").select().where("log.evtDatetime >= :nowTime", { nowTime: now }).andWhere("log.evtType = :type", { type: evtTypes }).getMany();
        } else if (keyWord) {
            logContent = await this.orm_repository.createQueryBuilder("log").select().where("log.evtDatetime >= :nowTime", { nowTime: now }).andWhere("POSITION(:keyWords in log.content) >= 1", { keyWords: keyWord }).orderBy("evtDatetime", "DESC").getMany();
        } else {
            logContent = await this.orm_repository.createQueryBuilder("log").select().where("log.evtDatetime >= :nowTime", { nowTime: now }).getMany();
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
    }

    /** 新建log訊息 ([httppost] /System/addLog) */
    async addLogs(request: Request, response: Response, next: NextFunction) {
        const req_data = <SysLog>request.body;
        if (!request.body.evtDatetime) {
            const now = new Date(Date.now());
            req_data.evtDatetime = now;
        }
        const result = this.orm_repository.save(req_data);
        return result.then(results => { return results; }).catch(err => { return err });
    }
}