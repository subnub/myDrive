"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const getFileSize = (path) => {
    return new Promise((resolve, reject) => {
        fs_1.default.stat(path, (error, stats) => {
            if (error) {
                resolve(0);
            }
            resolve(stats.size);
        });
    });
};
exports.default = getFileSize;
