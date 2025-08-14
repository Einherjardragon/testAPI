import { createClient } from 'redis';
const config_data = require('../global.json');
const logger = require("./logger");

export class redisClient {
    async redisGetData(_key) {
        const client = createClient({ url: `redis://${config_data.global.redis_ip}:6379` });
        // const client = createClient(6379,'127.0.0.1');
        // createClient({
        //     url: 'redis://alice:foobared@awesome.redis.server:6380'
        // });

        client.on('error', err => { return { state: 404, message: `Redis Client Error ${err}` } });
        await client.connect();
        const value = await client.get(_key);
        await client.disconnect();
        return { state: 200, message: value };
    }
    async redisSaveData(_key, _value) {
        // const client = createClient();
        const client = createClient({ url: `redis://${config_data.global.redis_ip}:6379` });
        // createClient({
        //     url: 'redis://alice:foobared@awesome.redis.server:6380'
        // });

        client.on('error', err => { logger.error(`Redis Client save ${_key} occur Error ${err}`); return { stateCode: 404, message: `Redis Client Error ${err}` }; });
        await client.connect();
        // await client.set(_key, _value);
        // await client.expire(_key, 86400);
        await client.set(_key, _value, { EX: 604800 });  //7天
        await client.disconnect();
        logger.info(`Redis Client save ${_key} OK.`);
        return { stateCode: 200, message: "OK" };
    }

    async redisRemoveKey(_key) {
        const client = createClient({ url: `redis://${config_data.global.redis_ip}:6379` });

        client.on('error', err => { logger.error(`Redis Client delete ${_key} occur Error ${err}`); return { stateCode: 404, message: `Redis Client Error ${err}` }; });
        await client.connect();
        await client.del(_key,);
        await client.disconnect();
        logger.info(`Redis Client delete ${_key} OK.`);
        return { stateCode: 200, message: "OK" };
    }
    async redisRemoveMultipleKey(_key) {
        const client = createClient({ url: `redis://${config_data.global.redis_ip}:6379` });

        client.on('error', err => { logger.error(`Redis Client delete occur Error ${err}`); return { stateCode: 404, message: `Redis Client Error ${err}` }; });
        await client.connect();
        await client.del(_key);
        await client.disconnect();
        logger.info(`Redis Client Multiple delete OK.`);
        return { stateCode: 200, message: "OK" };
    }
}


