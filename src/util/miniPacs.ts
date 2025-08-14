const request = require('request');
const config_data = require('../global.json');

export class miniPacs {
    async getSeriesUUID(seriesID) {
        const urlString = `${config_data.global.orthanc_dicom_web_api}/tools/find`;
        const body = {
            "Level": "Series",
            "Query": { "SeriesInstanceUID": seriesID }
        }
        const result = await this.doRequest(urlString, 'POST', body);
        return result;
    }
    async deleteDICOM(seriesArray) {
        const aryLength = seriesArray.length;
        for (let i = 0; i < aryLength; i++) {
            const urlString = `${config_data.global.orthanc_dicom_web_api}/series/${seriesArray[i]}`;
            await this.doRequest(urlString, "DELETE", {});
        }
    }
    doRequest(url, method, body): any {
        return new Promise(function (resolve, reject) {
            request({
                uri: url,
                headers: { 'Authorization': 'Basic ZG9ua2V5OnBvaXV5dHJld3E=' },
                json: body,
                method: method
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
}

