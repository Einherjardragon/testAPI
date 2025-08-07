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
exports.TourCarCase = void 0;
const typeorm_1 = require("typeorm");
(0, typeorm_1.Index)(["map_job"]);
let TourCarCase = class TourCarCase {
};
exports.TourCarCase = TourCarCase;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("increment", { type: 'bigint', unsigned: true }),
    __metadata("design:type", Number)
], TourCarCase.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 128, width: 128, default: null }),
    __metadata("design:type", String)
], TourCarCase.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 256, default: 'N/A', nullable: true }),
    __metadata("design:type", String)
], TourCarCase.prototype, "studyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 256, default: 'N/A', nullable: true }),
    __metadata("design:type", String)
], TourCarCase.prototype, "seriesId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 256, default: 'N/A', nullable: true }),
    __metadata("design:type", String)
], TourCarCase.prototype, "instancesUUId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 256, width: 256, default: '0' }),
    __metadata("design:type", String)
], TourCarCase.prototype, "map_job", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 256, width: 256, default: '0' }),
    __metadata("design:type", String)
], TourCarCase.prototype, "caseName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], TourCarCase.prototype, "series", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 128, width: 128, default: null }),
    __metadata("design:type", String)
], TourCarCase.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint', default: 0 }),
    __metadata("design:type", Number)
], TourCarCase.prototype, "upload", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 256, width: 256, default: null }),
    __metadata("design:type", String)
], TourCarCase.prototype, "mapping", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint', default: 1 }),
    __metadata("design:type", Number)
], TourCarCase.prototype, "postAI", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint', default: 1 }),
    __metadata("design:type", Number)
], TourCarCase.prototype, "postPACS", void 0);
exports.TourCarCase = TourCarCase = __decorate([
    (0, typeorm_1.Entity)()
], TourCarCase);
