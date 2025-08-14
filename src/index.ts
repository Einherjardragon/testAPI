import "reflect-metadata";
import { createConnection, getRepository } from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import { Routes } from "./routes";
// import * as fileUpload from "express-fileupload";
const fileUpload = require('express-fileupload');
const logger = require("./util/logger");
// const fs = require("fs");
// import { getRepository } from "typeorm";
// import { SysUser } from "./entity/SysUsers";
// import { SysUserRole } from "./entity/SysUserRoles";
// import { SysRole } from "./entity/SysRoles";
// import { SysRoleFuncs } from "./entity/SysRoleFuncs";
// import { SysFunction } from "./entity/SysFuncs";
// const aes = require('./util/crypto.js');
const config_data = require('./global.json');
import * as session from 'express-session';
// const session = require('express-session');
// import {ExampleEntity} from "./entity/ExampleEntity";
import * as http from "http";
// import * as https from "https";
import socket_controller from "./socket";
//http.globalAgent.maxSockets = 200;// 每一段時間request最大併發量
// const https_option = {
//     key: fs.readFileSync("./server.key"),
//     cert: fs.readFileSync("./server.cert"),
// }
// https.createServer(https_option,app);

declare module 'express-session' {
    interface SessionData {
        user: { name: '', permissions: any };
    }
}

createConnection(
    {
        "type": "mysql",
        "host": config_data.global.db_host_ip,
        "port": config_data.global.db_port,
        "username": config_data.global.db_uid,
        "password": config_data.global.db_pwd,
        "database": config_data.global.db_dbname,
        "synchronize": true,
        "logging": false,
        "entities": [
            "entity/**/*.js"
        ],
    }
).then(async connection => {
    // create express app
    const app = express();
    app.use(session({
        secret: 'ihjJG:xI?DYYI-AFfE.$XV$F)Aj~Z>=HW!<H/(i#Li)RAFAq!:WZ*cnb$UN-bUeZh?>dVwvVCLX^KwBAAJkfQmgvalHy-R$WSm<Y-:H#(^uh~%Xht>ApCeuFqCMJJ^pU',
        resave: false,
        rolling: true,
        saveUninitialized: false,  //避免存進太多空session
        cookie: { maxAge: 7200 * 1000 }
    }));
    const Jsonoption = { limit: '512mb', extended: true };
    app.use(bodyParser.json(Jsonoption));
    app.use(bodyParser.text());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(fileUpload({
        limits: { fileSize: 200 * 1024 * 1024 }
    }));
    // socket
    const server = http.createServer(app);
    const io = require('socket.io')(server);
    const sockets = new socket_controller(io);
    //schedule
    // initUser();
    // register express routes from defined application routes
    Routes.forEach(route => {
        (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
            const notCheckAction = ["UserLogin", "alreadyLogin", "UserLogout"];
            //條件判定，除了登入相關  新增修改權限需開才可執行System相關
            // if (notCheckAction.includes(route.action) == true) {
            const result = (new (route.controller as any))[route.action](req, res, next, sockets);
            // "/License/DMI" 需要download資料不透過此處response，而是透過filestream pipe執行
            if (route.route !== "/License/DMI") {
                if (result instanceof Promise) {
                    result.then(result => result !== null && result !== undefined ? res.json(result) : res.status(404).send("undefined")).catch(error => { res.status(404).json(error) });
                } else if (result !== null && result !== undefined) {
                    res.json(result);
                }
            }
            // }else{
            //     res.status(404).json({message:"permission denied"});
            // }
        });
    });

    // setup express app here
    // ...

    // start express server
    server.listen(config_data.global.api_host_port, async function () {
        logger.info(`Express server has started on port ${config_data.global.api_host_port}. `);
    });

    // // insert new users for test
    // await connection.manager.save(connection.manager.create(ExampleEntity, {
    //     firstName: "Timber",
    //     lastName: "Saw",
    //     age: 27
    // }));
    // await connection.manager.save(connection.manager.create(ExampleEntity, {
    //     firstName: "Phantom",
    //     lastName: "Assassin",
    //     age: 24
    // }));

}).catch(error => logger.error(error));
