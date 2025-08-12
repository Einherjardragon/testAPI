"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger = require("../util/logger");
class SocketConnect {
    constructor(io) {
        this.io = io;
        this.io.on('connection', (socket) => {
            logger.info("socket is connection!");
            socket.on("disconnect", () => {
                logger.info(`socket closed!!`);
            });
        });
    }
    sendInfo(message) {
        this.io.emit('dc_upload', message);
    }
    sendUpdateTourCar(message) {
        this.io.emit('hamster', message);
    }
    startCshMed(message) {
        this.io.emit('ana_rq', JSON.stringify(message));
    }
}
exports.default = SocketConnect;
