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
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const express = require("express");
const bodyParser = require("body-parser");
const routes_1 = require("./routes");
const fileUpload = require('express-fileupload');
const logger = require("./util/logger");
const config_data = require('./global.json');
const session = require("express-session");
const http = require("http");
const socket_1 = require("./socket");
(0, typeorm_1.createConnection)({
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "username": config_data.global.db_uid,
    "password": config_data.global.db_pwd,
    "database": config_data.global.db_dbname,
    "synchronize": true,
    "logging": false,
    "entities": [
        "entity/**/*.js"
    ],
}).then((connection) => __awaiter(void 0, void 0, void 0, function* () {
    const app = express();
    app.use(session({
        secret: 'ihjJG:xI?DYYI-AFfE.$XV$F)Aj~Z>=HW!<H/(i#Li)RAFAq!:WZ*cnb$UN-bUeZh?>dVwvVCLX^KwBAAJkfQmgvalHy-R$WSm<Y-:H#(^uh~%Xht>ApCeuFqCMJJ^pU',
        resave: false,
        rolling: true,
        saveUninitialized: false,
        cookie: { maxAge: 7200 * 1000 }
    }));
    const Jsonoption = { limit: '512mb', extended: true };
    app.use(bodyParser.json(Jsonoption));
    app.use(bodyParser.text());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(fileUpload({
        limits: { fileSize: 200 * 1024 * 1024 }
    }));
    const server = http.createServer(app);
    const io = require('socket.io')(server);
    const sockets = new socket_1.default(io);
    routes_1.Routes.forEach(route => {
        app[route.method](route.route, (req, res, next) => {
            const notCheckAction = ["UserLogin", "alreadyLogin", "UserLogout"];
            const result = (new route.controller)[route.action](req, res, next, sockets);
            if (route.route !== "/License/DMI") {
                if (result instanceof Promise) {
                    result.then(result => result !== null && result !== undefined ? res.json(result) : res.status(404).send("undefined")).catch(error => { res.status(404).json(error); });
                }
                else if (result !== null && result !== undefined) {
                    res.json(result);
                }
            }
        });
    });
    server.listen(config_data.global.api_host_port, function () {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info(`Express server has started on port ${config_data.global.api_host_port}. `);
        });
    });
})).catch(error => logger.error(error));
