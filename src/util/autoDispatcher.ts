// // const config_data = require('../container/global_conf.js');
// // const dicomCaches = require('../module/dicomCache.js');
// // const Sys_log = require('../container/Sys_log.js');
// // const dicomCache = require('../module/dicomCache.js');
// import { getRepository } from "typeorm";
// import { SysLog } from "../entity/SysLogs";
// import { DICOMAnnotated } from "../entity/DICOMAnnonated";
// import { DICOMPacs } from "../entity/DICOMPacs";
// const request = require('request');
// const config_data = require('../global.json');

// export class autoDispatcher {
//     constructor(){
        
//     }
//     // autoRouteSetting = {};
//     // assignedRouteSetting = false;
//     private orm_Log = getRepository(SysLog);
//     private orm_anno = getRepository(DICOMAnnotated);
//     private orm_pacs = getRepository(DICOMPacs);

//     async AutoRouteOfAIProcess(series_instance_UID) {
//         const autoRoute = config_data.global.auto_route;

//         return new Promise<any>(async (resolve, reject) => {
//             let notifyTo = [];

//             try {
//                 /**
//                  * query example
//                  * http://host/dicom-web/series?SeriesInstanceUID=1.2.392.200036.9116.2.5.1.37.2430062718.1602636732.32283&00080060=CT&00180015=CHEST&includefield=00180050,0008103e
//                 */
//                 for (const settItem of autoRoute) {
//                     let haveBinding = false;
//                     let qry_str = `${config_data.global.orthanc_dicom_web_api}/dicom-web/series?SeriesInstanceUID=${series_instance_UID}`;
//                     const setItemName = Object.keys(settItem)[0];
//                     let checkFields = "";
//                     let includeFields = "&includefield=0020000D"; //0020000D=>studyId
//                     const chkItems = settItem[setItemName].Check;//settingItem["Check"];
//                     if (chkItems) {
//                         for (const chk of chkItems) {
//                             includeFields += `,${chk.Key}`;
//                             if (Array.isArray(chk.Value)) {
//                                 checkFields += `&${chk.Key}=${chk.Value.join()}`;
//                             } else {
//                                 checkFields += `&${chk.Key}=${chk.Value}`;
//                             }
//                         }
//                     }

//                     const bndItems = settItem[setItemName].Binding;//settingItem["Binding"];
//                     if (bndItems) {
//                         haveBinding = (bndItems && Array.isArray(bndItems) && (bndItems.length > 0));
//                         if (haveBinding) {
//                             for (const bnd of bndItems) {
//                                 includeFields += `,${bnd.Key}`;
//                             }
//                         }
//                     }

//                     let postRef = "Default";
//                     const postRefVal = settItem[setItemName].PostRef;
//                     let havePostRef = postRefVal ? true : false;
//                     if (haveBinding) {
//                         if (havePostRef && (postRefVal === "Master" || postRefVal === "Slave")) {
//                             postRef = postRefVal;
//                         } else {
//                             postRef = "Default";
//                         }
//                     }

//                     qry_str += (checkFields + includeFields);
//                     const qry_result = await this.doRequest(qry_str);
//                     const resp_objs = JSON.parse(qry_result);
//                     if (resp_objs.length > 0) {
//                         /**  remove with binding check : 2020/11/3 by Fox */
//                         //若有查到資料, 則代表可以通知特定AI進行啟動
//                         if (haveBinding) {
//                             //去確認並進行主、附系列的綁定作業
//                             const studyId = resp_objs[0]["0020000D"].Value;
//                             includeFields += ",0020000E";
//                             //http://10.100.40.129:8042/dicom-web/studies/1.2.826.0.1.3680043.2.941.1.1.10.1.310910141715/series?00080060=CT&00180015=CHEST&includefield=0020000E
//                             const findStudySeries_str = `${config_data.global.orthanc_dicom_web_api}/dicom-web/studies/${studyId}/series?${checkFields}${includeFields}`;
//                             const resp_series_json = await this.doRequest(findStudySeries_str);
//                             const resp_series = JSON.parse(resp_series_json);
//                             if (resp_series.length > 0) {
//                                 let [master_series, slave_series, binding_err] = await this.todoBindingProc(resp_series, bndItems);
//                                 if (!binding_err) {
//                                     switch (postRef) {
//                                         case "Master": {
//                                             const findPacs = await this.orm_pacs.findOne({ where: { series_instance_UID: master_series } });
//                                             if (findPacs) {
//                                                 findPacs.state = 0;
//                                                 findPacs.upd_time = new Date(Date.now());
//                                                 this.orm_pacs.save(findPacs);
//                                             } else {
//                                                 const PacsData = {
//                                                     series_instance_UID: master_series,
//                                                     created_datetime: new Date(Date.now()),
//                                                     upd_time: new Date(Date.now()),
//                                                     state: 0
//                                                 };
//                                                 this.orm_pacs.save(PacsData);
//                                             }
//                                             // dicomCache.ins_or_upd_postRef(master_series, 0);
//                                         } break;
//                                         case "Slave": {
//                                             const findPacs = await this.orm_pacs.findOne({ where: { series_instance_UID: slave_series } });
//                                             if (findPacs) {
//                                                 findPacs.state = 0;
//                                                 findPacs.upd_time = new Date(Date.now());
//                                                 this.orm_pacs.save(findPacs);
//                                             } else {
//                                                 const PacsData = {
//                                                     series_instance_UID: slave_series,
//                                                     created_datetime: new Date(Date.now()),
//                                                     upd_time: new Date(Date.now()),
//                                                     state: 0
//                                                 };
//                                                 this.orm_pacs.save(PacsData);
//                                             }
//                                             // dicomCache.ins_or_upd_postRef(slave_series, 0);
//                                         } break;
//                                         default: {
//                                             const findPacs = await this.orm_pacs.findOne({ where: { series_instance_UID: series_instance_UID } });
//                                             if (findPacs) {
//                                                 findPacs.state = 0;
//                                                 findPacs.upd_time = new Date(Date.now());
//                                                 this.orm_pacs.save(findPacs);
//                                             } else {
//                                                 const PacsData = {
//                                                     series_instance_UID: series_instance_UID,
//                                                     created_datetime: new Date(Date.now()),
//                                                     upd_time: new Date(Date.now()),
//                                                     state: 0
//                                                 };
//                                                 this.orm_pacs.save(PacsData);
//                                             }
//                                             // dicomCache.ins_or_upd_postRef(series_instance_UID, 0); 
//                                         } break;
//                                     }
//                                 }
//                             }
//                             //比對是否為定義是主要處理的病例
//                             for (const rItem of resp_series) {
//                                 let matchCondition = true;
//                                 const resp_seriesUID = rItem["0020000E"].Value;
//                                 if (resp_seriesUID == series_instance_UID) {
//                                     for (const bnd of bndItems) {
//                                         if (rItem[bnd.Key] && rItem[bnd.Key].Value == bnd.Master) {
//                                             continue;
//                                         }
//                                         else {
//                                             matchCondition = false;
//                                             break;
//                                         }
//                                     }
//                                     if (matchCondition) {
//                                         notifyTo.push(setItemName);
//                                     }
//                                 }
//                             }
//                         } else {
//                             if (postRef === "Default") {
//                                 const findPacs = await this.orm_pacs.findOne({ where: { series_instance_UID: series_instance_UID } });
//                                 if (findPacs) {
//                                     findPacs.state = 0;
//                                     findPacs.upd_time = new Date(Date.now());
//                                     this.orm_pacs.save(findPacs);
//                                 } else {
//                                     const PacsData = {
//                                         series_instance_UID: series_instance_UID,
//                                         created_datetime: new Date(Date.now()),
//                                         upd_time: new Date(Date.now()),
//                                         state: 0
//                                     };
//                                     this.orm_pacs.save(PacsData);
//                                 }
//                                 // dicomCache.ins_or_upd_postRef(series_instance_UID, 0);
//                             }
//                             notifyTo.push(setItemName);
//                         }
//                     }
//                 }
//                 resolve(notifyTo);
//             } catch (err) {
//                 console.log(`AutoRouteOfAIProcess cause a error:${err}`);
//                 reject(notifyTo);
//             }
//         });
//     }

//     todoBindingProc(findSeries, bindingCheckItems): any {
//         return new Promise(async (resolve, reject) => {
//             let master_series = "";
//             let slave_series = "";
//             const bcCount = bindingCheckItems.length;
//             try {
//                 for (const se of findSeries) {
//                     let matchCondition = true;
//                     let masterCount = 0;
//                     let slaveCount = 0;
//                     const seriesId = se["0020000E"].Value; //series instance UID
//                     for (const bnd of bindingCheckItems) {
//                         if (se[bnd.Key] && se[bnd.Key].Value == bnd.Master) {
//                             masterCount++;
//                             continue;
//                         } else if (se[bnd.Key] && se[bnd.Key].Value == bnd.Slave) {
//                             slaveCount++;
//                             continue;
//                         } else {
//                             matchCondition = false;
//                             break;
//                         }
//                     }
//                     if (matchCondition) {
//                         if (masterCount === bcCount) { master_series = seriesId; }
//                         if (slaveCount === bcCount) { slave_series = seriesId; }
//                     }
//                 }
//                 if (master_series !== "" && slave_series !== "") {
//                     // let req = { params: { series: master_series } };

//                     const findAnno = await this.orm_anno.findOne({ where: { series_instance_UID: slave_series } });
//                     findAnno.series_instance_UID = slave_series;
//                     const updateAnno = this.orm_anno.save(findAnno);
//                     updateAnno.then(res => {
//                         // Sys_log.log_sent(21, `set an annotateLink ${slave_series} !`, master_series);
//                         const LogMessage = {
//                             evtType: 21,
//                             evtDatetime: new Date(Date.now()),
//                             content: `set an annotateLink ${slave_series} !`
//                         };
//                         this.orm_Log.save(LogMessage);
//                     }).catch(err => {
//                         // Sys_log.log_sent(21, `update annotateLink field cause an error! ${err}`, master_series);
//                         const LogMessage = {
//                             evtType: 21,
//                             evtDatetime: new Date(Date.now()),
//                             content: `update annotateLink field cause an error! ${err}`
//                         };
//                         this.orm_Log.save(LogMessage);
//                     });
//                 }
//             }
//             catch (err) {
//                 reject([master_series, slave_series, err]);
//             }
//             resolve([master_series, slave_series]);
//         });

//     }

//     doRequest (url): any {
//         return new Promise(function (resolve, reject) {
//             request({ uri: url, headers: { 'Authorization': 'Basic ZG9ua2V5OnBvaXV5dHJld3E=' } },
//                 function (error, res, body) {
//                     if (!error && res.statusCode == 200) {
//                         resolve(body);
//                     } else {
//                         reject(error);
//                     }
//                 });
//         });
//     }



//     // todoAutoRoute = function (studyId) {
//     //     return new Promise(async (resolve, reject) => {
//     //         let notifyTo = [];
//     //         let searchKeyValues = "";
//     //         try {
//     //             const global_auto_route_setting = this.getAutoRouteSetting(config_data.global.auto_route)["Check"];
//     //             if (!global_auto_route_setting) { resolve(notifyTo); }

//     //             for (let i = 0; i < global_auto_route_setting.length; i++) {
//     //                 let firstLoopOfKey = true;
//     //                 const checkKeys = global_auto_route_setting[i].checkKeys;
//     //                 for (let j = 0; j < checkKeys.length; j++) {
//     //                     let tmp_val = "";
//     //                     let firstLoopOfVal = true;

//     //                     for (let k = 0; k < checkKeys[j].defValues.length; k++) {
//     //                         if (firstLoopOfVal) {
//     //                             tmp_val = checkKeys[j].defValues[k];
//     //                             firstLoopOfVal = false;
//     //                         }
//     //                         else {
//     //                             tmp_val += `,${checkKeys[j].defValues[k]}`;
//     //                         }
//     //                     }
//     //                     if (firstLoopOfKey) {
//     //                         searchKeyValues = `${checkKeys[j].key}=${tmp_val}`;
//     //                     } else {
//     //                         searchKeyValues += `&${checkKeys[j].key}=${tmp_val}`;
//     //                     }
//     //                 }

//     //                 const qry_url2 = `${config_data.global.orthanc_dicom_web_api}/dicom-web/studies/${studyId}/series?${searchKeyValues}`;
//     //                 const stp2_body_str = await this.doRequest(qry_url2);
//     //                 const stp2_body = JSON.parse(stp2_body_str);
//     //                 if (stp2_body.length > 0) {
//     //                     notifyTo.push(global_auto_route_setting[i].key);
//     //                 }
//     //             }
//     //             resolve(notifyTo);
//     //         } catch (err) {
//     //             reject(err);
//     //         }
//     //     });
//     // }


//     // getAutoRouteSetting = function (auto_route_setting) {
//     //     if (assignedRouteSetting) {
//     //         return autoRouteSetting;
//     //     }
//     //     let buf_check = [];
//     //     let buf_binding = [];
//     //     const _route = auto_route_setting;

//     //     for (const setItem of _route) {
//     //         for (const itemName in setItem) {

//     //             for (let i = 0; i < setItem[itemName].length; i++) {
//     //                 if (setItem[itemName][i].Check) {
//     //                     const loopLen = setItem[itemName][i].Check.length;
//     //                     let checkKeys = [];
//     //                     for (let j = 0; j < loopLen; j++) {
//     //                         const tmp = setItem[itemName][i].Check[j];
//     //                         const key = tmp["Key"];
//     //                         let compValues = [];
//     //                         if (tmp["Value"] instanceof Array) {
//     //                             [...compValues] = tmp["Value"];
//     //                         }
//     //                         else { compValues.push(tmp["Value"]); }
//     //                         checkKeys.push({ key: key, defValues: compValues });
//     //                     }
//     //                     buf_check.push({ key: itemName, checkKeys: checkKeys });
//     //                 } else if (setItem[itemName][i].Binding) {
//     //                     const loopLen = setItem[itemName][i].Binding.length;
//     //                     let checkKeys = [];
//     //                     for (let j = 0; j < loopLen; j++) {
//     //                         const tmp = setItem[itemName][i].Binding[j];
//     //                         const key = tmp["Key"];
//     //                         const master = tmp["Master"];
//     //                         const slave = tmp["Slave"];
//     //                         checkKeys.push({ key: key, defMaster: master, defSlave: slave });
//     //                     }
//     //                     buf_binding.push({ key: itemName, checkKeys: checkKeys });
//     //                 }
//     //             }
//     //         }
//     //     }

//     //     autoRouteSetting = {
//     //         "Check": buf_check,
//     //         "Binding": buf_binding
//     //     };

//     //     assignedRouteSetting = true;

//     //     return autoRouteSetting;
//     // }
// };
// module.exports = autoDispatcher;