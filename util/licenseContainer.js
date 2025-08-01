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
exports.licenseContainer = void 0;
const rabbitMQ_1 = require("../util/rabbitMQ");
const _Docker = require('dockerode');
const _docker = new _Docker({ socketPath: '/var/run/docker.sock' });
const logger = require("./logger");
class licenseContainer {
    constructor() {
        this.rabbits = new rabbitMQ_1.rabbit();
    }
    restart() {
        return __awaiter(this, void 0, void 0, function* () {
            const containers = yield new Promise((resolve, reject) => {
                _docker.listContainers(function (err, containers) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (err) {
                            reject(err);
                            logger.error(`docker list error: ${err}`);
                        }
                        resolve(containers);
                    });
                });
            });
            if (!containers) {
                logger.error("Not find docker containers.");
            }
            const findLicenseContainerIndex = containers.findIndex(container => {
                return container.Image.includes("v5lcc");
            });
            if (findLicenseContainerIndex != -1) {
                let licenseContainerId = containers[findLicenseContainerIndex].Id;
                logger.info("restart license container.");
                _docker.getContainer(licenseContainerId).restart(() => { logger.info(`containerId: ${licenseContainerId} restart.`); });
                let licenseStatus = yield this.getLicenseState("v5lcc01", licenseContainerId);
                let licenseCheck = setInterval(() => {
                    if (licenseStatus == "running") {
                        clearInterval(licenseCheck);
                        logger.info("restart license container.");
                        let MQ_message = {
                            req_time: this.MQ_time(),
                            rep_params: "1",
                        };
                        this.rabbits.connecting('wp_MED01-License', MQ_message, 0);
                    }
                }, 500);
            }
        });
    }
    getLicenseState(containerName, ContainerId) {
        let getContainer = _docker.getContainer(ContainerId);
        return new Promise((resolve, reject) => {
            getContainer.inspect((err, data) => {
                if (err) {
                    logger.error(err);
                    reject(false);
                }
                ;
                logger.info(`docker container ${containerName} status is: ${data.State.Status}`);
                resolve(data.State.Status);
            });
        });
    }
    MQ_time() {
        var nowTimte = new Date();
        var text = "";
        var hours = nowTimte.getHours() < 10 ? "0" + nowTimte.getHours() : nowTimte.getHours();
        text = text + nowTimte.getFullYear();
        text = text + ((nowTimte.getMonth() + 1) < 10 ? "0" + (nowTimte.getMonth() + 1) : (nowTimte.getMonth() + 1));
        text =
            text +
                (nowTimte.getDate() >= 10 ? nowTimte.getDate() : "0" + nowTimte.getDate());
        text = text + hours;
        text = text + nowTimte.getMinutes();
        return text;
    }
}
exports.licenseContainer = licenseContainer;
