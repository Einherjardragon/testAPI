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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.rabbit = void 0;
const typeorm_1 = require("typeorm");
const SysLogs_1 = require("../entity/SysLogs");
const MqControl_1 = require("../entity/MqControl");
var amqp = require("amqplib/callback_api");
const config_data = require('../global.json');
var nackedMsg = [];
const logger = require("./logger");
const opt = { credentials: require('amqplib/callback_api').credentials.plain(config_data.global.mq_uid, config_data.global.mq_pwd) };
let queueLengtx = ((_a = config_data.global) === null || _a === void 0 ? void 0 : _a.RMQMaxLen) && ((_b = config_data.global) === null || _b === void 0 ? void 0 : _b.RMQMaxLen) != 0 ? config_data.global.RMQMaxLen : 10;
class rabbit {
    constructor() {
        this.orm_Log = (0, typeorm_1.getRepository)(SysLogs_1.SysLog);
        this.orm_mq = (0, typeorm_1.getRepository)(MqControl_1.QueueControl);
    }
    connecting(queName, message, priority = 0, isFirst = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const _this = this;
            return new Promise((resolve, rejuct) => __awaiter(this, void 0, void 0, function* () {
                let isPublish = true;
                yield amqp.connect(`amqp://${config_data.global.mq_host}`, opt, function (err, connection) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (err) {
                            throw err;
                        }
                        connection.on("error", (error) => __awaiter(this, void 0, void 0, function* () {
                            console.error('connection errorMessage:' + error);
                            _this.connecting(queName, message, priority);
                        }));
                        yield connection.createConfirmChannel(function (err2, ch) {
                            if (err2) {
                                throw err2;
                            }
                            const now = new Date(Date.now());
                            const queue = queName;
                            var msg = message;
                            ch.on("error", (error) => __awaiter(this, void 0, void 0, function* () {
                                console.error('channel errorMessage:' + error);
                                _this.connecting(queName, message, priority);
                            }));
                            ch.on("error", (error) => __awaiter(this, void 0, void 0, function* () {
                                console.error('channel errorMessage:' + error);
                                _this.connecting(queName, message, priority);
                            }));
                            ch.assertQueue(queue, {
                                durable: true,
                                autoDelete: true,
                                maxPriority: 5,
                                maxLength: queueLengtx
                            }, (ch_err, ch_msg) => __awaiter(this, void 0, void 0, function* () {
                                if (ch_err) {
                                    throw ch_err;
                                }
                                const mqListLen = yield _this.orm_mq.findOne({ where: { queue_name: queue } });
                                if (ch_msg.messageCount * 1 + ch_msg.consumerCount * 1 > 8 || (mqListLen && isFirst)) {
                                    const LogMessage = {
                                        evtType: 21,
                                        evtDatetime: now,
                                        content: `Save queue ${queue} in table.`,
                                    };
                                    const insert_queue = yield _this.orm_mq.findOne({
                                        where: {
                                            seriesId: msg.seriesId,
                                            queue_name: queue
                                        }
                                    });
                                    if (!insert_queue) {
                                        const queueObj = new MqControl_1.QueueControl();
                                        queueObj.content = JSON.stringify(msg);
                                        queueObj.created_time = now;
                                        queueObj.queue_name = queue;
                                        queueObj.seriesId = msg.seriesId || "";
                                        queueObj.priority = priority;
                                        yield _this.orm_Log.save(LogMessage);
                                        yield _this.orm_mq.save(queueObj);
                                    }
                                    isPublish = false;
                                    resolve(isPublish);
                                }
                                ch.on('return', (msg) => {
                                    console.log("return:" + msg);
                                });
                                if (nackedMsg.length > 0) {
                                    for (var i = 0, l = nackedMsg.length; i < l; i++) {
                                        if (nackedMsg.length > 0 && isPublish && nackedMsg[0].queue == queue) {
                                            ch.publish('', nackedMsg[0].queue, Buffer.from(JSON.stringify(nackedMsg[0].msg)), { persistent: true, confirm: true, priority: 5 }, function (err, ok) {
                                                if (err != null) {
                                                    console.warn("Message nacked!" + err);
                                                }
                                                else {
                                                    nackedMsg.splice(0, 1);
                                                    console.log("message acked");
                                                }
                                            });
                                        }
                                    }
                                }
                                if (isPublish) {
                                    ch.publish('', queue, Buffer.from(JSON.stringify(msg)), { persistent: true, confirm: true, priority: priority }, function (err, ok) {
                                        return __awaiter(this, void 0, void 0, function* () {
                                            if (err != null) {
                                                nackedMsg.push({ queue, msg });
                                                logger.error("Message nacked!" + msg);
                                            }
                                            else {
                                                logger.info(" [x] Sent '%s' '%s' '%s'", queue, msg, priority);
                                                yield ch.close();
                                                yield connection.close();
                                            }
                                        });
                                    });
                                    resolve(isPublish);
                                }
                            }));
                        });
                    });
                });
            })).then(res => {
                return res;
            }).catch(error => {
                console.log("rabbitMQ connect error:" + error);
                _this.connecting(queName, message, priority);
            });
        });
    }
}
exports.rabbit = rabbit;
