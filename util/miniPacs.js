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
exports.miniPacs = void 0;
const request = require('request');
const config_data = require('../global.json');
class miniPacs {
    getSeriesUUID(seriesID) {
        return __awaiter(this, void 0, void 0, function* () {
            const urlString = `${config_data.global.orthanc_dicom_web_api}/tools/find`;
            const body = {
                "Level": "Series",
                "Query": { "SeriesInstanceUID": seriesID }
            };
            const result = yield this.doRequest(urlString, 'POST', body);
            return result;
        });
    }
    deleteDICOM(seriesArray) {
        return __awaiter(this, void 0, void 0, function* () {
            const aryLength = seriesArray.length;
            for (let i = 0; i < aryLength; i++) {
                const urlString = `${config_data.global.orthanc_dicom_web_api}/series/${seriesArray[i]}`;
                yield this.doRequest(urlString, "DELETE", {});
            }
        });
    }
    doRequest(url, method, body) {
        return new Promise(function (resolve, reject) {
            request({
                uri: url,
                headers: { 'Authorization': 'Basic ZG9ua2V5OnBvaXV5dHJld3E=' },
                json: body,
                method: method
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
}
exports.miniPacs = miniPacs;
