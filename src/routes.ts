import { SysLogController } from "./controller/SysLogController";
import { TourCarController } from './controller/TourCarController';

export const Routes = [
    {
        method: "get",
        route: "/tourCar",
        controller: TourCarController,
        action: "getTourCar"
    },
    {
        method: "post",
        route: "/tourCar",
        controller: TourCarController,
        action: "saveTourCar"
    },
    {
        method: "delete",
        route: "/tourCar",
        controller: TourCarController,
        action: "deleteTourCar"
    },
    {
        method: "post",
        route: "/tourCarCase/:case/retryPACS",
        controller: TourCarController,
        action: "retryPACS"
    },
    {
        method: "post",
        route: "/tourCarCase/:case/retryAI",
        controller: TourCarController,
        action: "retryAI"
    },
    {
        method: "get",
        route: "/tourCarCase/:job",
        controller: TourCarController,
        action: "getTourCarCase"
    },
    {
        method: "post",
        route: "/tourCarCase/:job",
        controller: TourCarController,
        action: "saveTourCarCase"
    },
    {
        method: "post",
        route: "/tourCarCase/:case",
        controller: TourCarController,
        action: "reTourCarCaseMapping"
    },
    {
        method: "put",
        route: "/tourCarCase",
        controller: TourCarController,
        action: "updateTourCarCase"
    },
    //Logs
    {
        method: "post",
        route: "/api/Sys/SysLogs",    /** /System/addLog*/
        controller: SysLogController,
        action: "addLogs"
    },
    {
        method: "get",
        route: "/System/getSearchLog",
        controller: SysLogController,
        action: "getLogsSearch"
    },
    {
        method: "get",
        route: "/System/getSearchPatientLog",
        controller: SysLogController,
        action: "getLogsSearchPatient"
    },
];