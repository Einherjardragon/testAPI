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
exports.redisClient = void 0;
const redis_1 = require("redis");
const config_data = require('../global.json');
const logger = require("./logger");
class redisClient {
    redisGetData(_key) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = (0, redis_1.createClient)({ url: `redis://${config_data.global.redis_ip}:6379` });
            client.on('error', err => { return { state: 404, message: `Redis Client Error ${err}` }; });
            yield client.connect();
            const value = yield client.get(_key);
            yield client.disconnect();
            return { state: 200, message: value };
        });
    }
    redisSaveData(_key, _value) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = (0, redis_1.createClient)({ url: `redis://${config_data.global.redis_ip}:6379` });
            client.on('error', err => { logger.error(`Redis Client save ${_key} occur Error ${err}`); return { stateCode: 404, message: `Redis Client Error ${err}` }; });
            yield client.connect();
            yield client.set(_key, _value, { EX: 604800 });
            yield client.disconnect();
            logger.info(`Redis Client save ${_key} OK.`);
            return { stateCode: 200, message: "OK" };
        });
    }
    redisRemoveKey(_key) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = (0, redis_1.createClient)({ url: `redis://${config_data.global.redis_ip}:6379` });
            client.on('error', err => { logger.error(`Redis Client delete ${_key} occur Error ${err}`); return { stateCode: 404, message: `Redis Client Error ${err}` }; });
            yield client.connect();
            yield client.del(_key);
            yield client.disconnect();
            logger.info(`Redis Client delete ${_key} OK.`);
            return { stateCode: 200, message: "OK" };
        });
    }
    redisRemoveMultipleKey(_key) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = (0, redis_1.createClient)({ url: `redis://${config_data.global.redis_ip}:6379` });
            client.on('error', err => { logger.error(`Redis Client delete occur Error ${err}`); return { stateCode: 404, message: `Redis Client Error ${err}` }; });
            yield client.connect();
            yield client.del(_key);
            yield client.disconnect();
            logger.info(`Redis Client Multiple delete OK.`);
            return { stateCode: 200, message: "OK" };
        });
    }
}
exports.redisClient = redisClient;
