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
const prompt = require('password-prompt');
const env = require("../enviroment/env");
const crypto = require("crypto");
const getKey = () => __awaiter(void 0, void 0, void 0, function* () {
    if (process.env.KEY) {
        // For Docker 
        env.key = process.env.KEY;
    }
    else if (process.env.NODE_ENV) {
        let password = yield prompt("Enter Server Encryption Password: ", { method: "hide" });
        password = crypto.createHash("md5").update(password).digest("hex");
        env.key = password;
    }
    else {
        let password = "1234";
        password = crypto.createHash("md5").update(password).digest("hex");
        env.key = password;
    }
});
module.exports = getKey;
