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
exports.DICOMRecords = void 0;
const typeorm_1 = require("typeorm");
let DICOMRecords = class DICOMRecords {
};
exports.DICOMRecords = DICOMRecords;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("increment", { type: 'bigint', unsigned: true }),
    __metadata("design:type", Number)
], DICOMRecords.prototype, "_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, width: 64, default: null }),
    __metadata("design:type", String)
], DICOMRecords.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 256, width: 256, default: null }),
    __metadata("design:type", String)
], DICOMRecords.prototype, "studyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 256, default: 'N/A', nullable: true }),
    __metadata("design:type", String)
], DICOMRecords.prototype, "seriesId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', default: null }),
    __metadata("design:type", Date)
], DICOMRecords.prototype, "seriesDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, width: 64, default: null }),
    __metadata("design:type", String)
], DICOMRecords.prototype, "seriesBodyPartType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, width: 64, default: null }),
    __metadata("design:type", String)
], DICOMRecords.prototype, "SpecificCharacterSet", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', default: null }),
    __metadata("design:type", Date)
], DICOMRecords.prototype, "StudyDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, width: 64, default: null }),
    __metadata("design:type", String)
], DICOMRecords.prototype, "StudyTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 32, width: 32, default: null }),
    __metadata("design:type", String)
], DICOMRecords.prototype, "Modal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, width: 64, default: null }),
    __metadata("design:type", String)
], DICOMRecords.prototype, "ReferringPhysicianName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'longtext', default: null }),
    __metadata("design:type", String)
], DICOMRecords.prototype, "RetrieveURL", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, width: 64, default: null }),
    __metadata("design:type", String)
], DICOMRecords.prototype, "BirthDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 16, width: 16, default: null }),
    __metadata("design:type", String)
], DICOMRecords.prototype, "Sex", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 128, width: 128, default: null }),
    __metadata("design:type", String)
], DICOMRecords.prototype, "generatedStudyID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: null }),
    __metadata("design:type", Number)
], DICOMRecords.prototype, "NumberofSeries", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: null }),
    __metadata("design:type", Number)
], DICOMRecords.prototype, "NumberInstances", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', default: null }),
    __metadata("design:type", Number)
], DICOMRecords.prototype, "dataSource", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', default: null }),
    __metadata("design:type", Number)
], DICOMRecords.prototype, "storeMode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 512, width: 512, default: null }),
    __metadata("design:type", String)
], DICOMRecords.prototype, "storePath", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, width: 64, default: null }),
    __metadata("design:type", String)
], DICOMRecords.prototype, "accNum", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, width: 64, default: null }),
    __metadata("design:type", String)
], DICOMRecords.prototype, "patientName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, width: 64, default: null }),
    __metadata("design:type", String)
], DICOMRecords.prototype, "patientSex", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint', default: null }),
    __metadata("design:type", Number)
], DICOMRecords.prototype, "studyAge", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint', default: null }),
    __metadata("design:type", Number)
], DICOMRecords.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, width: 64, default: null }),
    __metadata("design:type", String)
], DICOMRecords.prototype, "map_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', default: null }),
    __metadata("design:type", Date)
], DICOMRecords.prototype, "upload_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, width: 64, default: null }),
    __metadata("design:type", String)
], DICOMRecords.prototype, "group_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint', default: 0 }),
    __metadata("design:type", Number)
], DICOMRecords.prototype, "processStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 128, width: 128, default: null }),
    __metadata("design:type", String)
], DICOMRecords.prototype, "AET", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 128, width: 128, default: null }),
    __metadata("design:type", String)
], DICOMRecords.prototype, "postToAET", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 128, width: 128, default: null }),
    __metadata("design:type", String)
], DICOMRecords.prototype, "filterUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'longtext', default: null }),
    __metadata("design:type", String)
], DICOMRecords.prototype, "dc_pos", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], DICOMRecords.prototype, "nodule_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 32, width: 32, default: '0' }),
    __metadata("design:type", String)
], DICOMRecords.prototype, "lung_score", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], DICOMRecords.prototype, "cac_risk", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], DICOMRecords.prototype, "agatston", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint', default: 0 }),
    __metadata("design:type", Number)
], DICOMRecords.prototype, "autosend", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint', default: 0 }),
    __metadata("design:type", Number)
], DICOMRecords.prototype, "isCompare", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint', default: 0 }),
    __metadata("design:type", Number)
], DICOMRecords.prototype, "isConfirm", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 256, default: '', nullable: true }),
    __metadata("design:type", String)
], DICOMRecords.prototype, "model_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 256, width: 256, default: '0' }),
    __metadata("design:type", String)
], DICOMRecords.prototype, "token", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 256, width: 256, default: '0' }),
    __metadata("design:type", String)
], DICOMRecords.prototype, "dmi_hash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'longtext', default: null }),
    __metadata("design:type", String)
], DICOMRecords.prototype, "list", void 0);
exports.DICOMRecords = DICOMRecords = __decorate([
    (0, typeorm_1.Index)(["patientId", "studyId", "seriesId"]),
    (0, typeorm_1.Entity)()
], DICOMRecords);
