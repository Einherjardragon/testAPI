"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Routes = void 0;
const SysLogController_1 = require("./controller/SysLogController");
const TourCarController_1 = require("./controller/TourCarController");
exports.Routes = [
    {
        method: "get",
        route: "/tourCar",
        controller: TourCarController_1.TourCarController,
        action: "getTourCar"
    },
    {
        method: "post",
        route: "/tourCar",
        controller: TourCarController_1.TourCarController,
        action: "saveTourCar"
    },
    {
        method: "delete",
        route: "/tourCar",
        controller: TourCarController_1.TourCarController,
        action: "deleteTourCar"
    },
    {
        method: "get",
        route: "/tourCarCase/:job",
        controller: TourCarController_1.TourCarController,
        action: "getTourCarCase"
    },
    {
        method: "post",
        route: "/tourCarCase/:job",
        controller: TourCarController_1.TourCarController,
        action: "saveTourCarCase"
    },
    {
        method: "post",
        route: "/tourCarCase/:case",
        controller: TourCarController_1.TourCarController,
        action: "reTourCarCaseMapping"
    },
    {
        method: "put",
        route: "/tourCarCase",
        controller: TourCarController_1.TourCarController,
        action: "updateTourCarCase"
    },
    {
        method: "post",
        route: "/api/Sys/SysLogs",
        controller: SysLogController_1.SysLogController,
        action: "addLogs"
    },
    {
        method: "get",
        route: "/System/getSearchLog",
        controller: SysLogController_1.SysLogController,
        action: "getLogsSearch"
    },
    {
        method: "get",
        route: "/System/getSearchPatientLog",
        controller: SysLogController_1.SysLogController,
        action: "getLogsSearchPatient"
    },
];
