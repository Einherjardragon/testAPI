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
exports.TourCar = void 0;
const typeorm_1 = require("typeorm");
let TourCar = class TourCar {
};
exports.TourCar = TourCar;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("increment", { type: 'bigint', unsigned: true }),
    __metadata("design:type", Number)
], TourCar.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 256, width: 256, default: '0' }),
    __metadata("design:type", String)
], TourCar.prototype, "job", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 256, width: 256, default: '0' }),
    __metadata("design:type", String)
], TourCar.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], TourCar.prototype, "series", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 128, width: 128, default: "Pending" }),
    __metadata("design:type", String)
], TourCar.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', default: null }),
    __metadata("design:type", Date)
], TourCar.prototype, "time", void 0);
exports.TourCar = TourCar = __decorate([
    (0, typeorm_1.Entity)()
], TourCar);
