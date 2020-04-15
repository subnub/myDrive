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
const getBusboyData = (busboy) => {
    return new Promise((resolve, reject) => {
        const formData = new Map();
        busboy.on("field", (field, val) => {
            formData.set(field, val);
        });
        busboy.on("file", (_, file, filename) => __awaiter(void 0, void 0, void 0, function* () {
            resolve({
                file,
                filename,
                formData
            });
        }));
    });
};
exports.default = getBusboyData;
