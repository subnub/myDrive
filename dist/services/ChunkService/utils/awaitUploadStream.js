"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const removeChunks_1 = __importDefault(require("../../FileService/utils/removeChunks"));
const awaitUploadStream = (inputSteam, outputStream, req) => {
    return new Promise((resolve, reject) => {
        inputSteam.on("error", (e) => {
            removeChunks_1.default(outputStream);
            reject({
                message: "Await Stream Input Error",
                code: 500,
                error: e
            });
        });
        outputStream.on("error", (e) => {
            removeChunks_1.default(outputStream);
            reject({
                message: "Await Stream Output Error",
                code: 500,
                error: e
            });
        });
        req.on("aborted", () => {
            console.log("Upload Request Cancelling...");
            removeChunks_1.default(outputStream);
        });
        inputSteam.pipe(outputStream).on("finish", (data) => {
            console.log("await stream finished");
            resolve(data);
        });
    });
};
exports.default = awaitUploadStream;
