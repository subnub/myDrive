"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const awaitStream = (inputSteam, outputStream) => {
    return new Promise((resolve, reject) => {
        inputSteam.on("error", (e) => {
            reject({
                message: "Await Stream Input Error",
                code: 500,
                error: e
            });
        });
        outputStream.on("error", (e) => {
            reject({
                message: "Await Stream Output Error",
                code: 500,
                error: e
            });
        });
        inputSteam.pipe(outputStream).on("finish", (data) => {
            console.log("await stream finished");
            resolve(data);
        });
    });
};
exports.default = awaitStream;
