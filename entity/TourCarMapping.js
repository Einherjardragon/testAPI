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
exports.TourCarMapping = void 0;
const typeorm_1 = require("typeorm");
(0, typeorm_1.Index)(["caseName"]);
let TourCarMapping = class TourCarMapping {
};
exports.TourCarMapping = TourCarMapping;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("increment", { type: 'bigint', unsigned: true }),
    __metadata("design:type", Number)
], TourCarMapping.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 256, width: 256, default: '0' }),
    __metadata("design:type", String)
], TourCarMapping.prototype, "caseName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'longtext', default: null }),
    __metadata("design:type", String)
], TourCarMapping.prototype, "accNumbers", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'longtext', default: null }),
    __metadata("design:type", String)
], TourCarMapping.prototype, "mapping_data", void 0);
exports.TourCarMapping = TourCarMapping = __decorate([
    (0, typeorm_1.Entity)()
], TourCarMapping);
