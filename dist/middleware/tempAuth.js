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
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const env = require("../enviroment/env");
const tempAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.params.tempToken;
        const decoded = yield jwt.verify(token, env.password);
        const iv = decoded.iv;
        const user = yield User.findOne({ _id: decoded._id });
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
            throw new Error("User Not Found");
        }
        else {
            user.tempTokens = user.tempTokens.filter((filterToken) => {
                return filterToken.token !== encryptedToken;
            });
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
module.exports = tempAuth;
