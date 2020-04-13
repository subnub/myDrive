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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const user_1 = __importDefault(require("../models/user"));
const env = require("../enviroment/env");
const tempAuthVideo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.params.tempToken;
        const decoded = yield jwt.verify(token, env.password);
        const iv = decoded.iv;
        if (req.params.uuid !== decoded.cookie) {
            throw new Error("Cookie mismatch");
        }
        const user = yield user_1.default.findOne({ _id: decoded._id });
        const encrpytionKey = user.getEncryptionKey();
        const encryptedToken = user.encryptToken(token, encrpytionKey, iv);
        let tokenFound = false;
        for (let i = 0; i < user.tempTokens.length; i++) {
            const currentToken = user.tempTokens[i].token;
            if (currentToken === encryptedToken) {
                tokenFound = true;
                break;
            }
        }
        if (!user || !tokenFound) {
            throw new Error("User not found");
        }
        else {
            yield user.save();
            req.user = user;
            req.auth = true;
            req.encryptedTempToken = encryptedToken;
            next();
        }
    }
    catch (e) {
        console.log(e);
        res.status(401).send();
    }
});
module.exports = tempAuthVideo;
