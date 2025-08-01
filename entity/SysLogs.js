"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SysLog = void 0;
const typeorm_1 = require("typeorm");
let SysLog = class SysLog {
};
exports.SysLog = SysLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("increment", { type: 'bigint', unsigned: true }),
    __metadata("design:type", Number)
], SysLog.prototype, "_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', default: null, length: 26, width: 26, comment: '病歷號碼' }),
    __metadata("design:type", String)
], SysLog.prototype, "acc_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'mediumtext', default: null }),
    __metadata("design:type", String)
], SysLog.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint' }),
    __metadata("design:type", Number)
], SysLog.prototype, "evtType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime' }),
    __metadata("design:type", Date)
], SysLog.prototype, "evtDatetime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', default: null, length: 100, width: 100, comment: '病人識別碼' }),
    __metadata("design:type", String)
], SysLog.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', default: null, length: 100, width: 100, comment: '病例號碼' }),
    __metadata("design:type", String)
], SysLog.prototype, "rel_id", void 0);
exports.SysLog = SysLog = __decorate([
    (0, typeorm_1.Entity)()
], SysLog);
