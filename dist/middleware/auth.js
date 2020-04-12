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
const auth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        const decoded = yield jwt.verify(token, env.password);
        const iv = decoded.iv;
        const user = yield User.findOne({ _id: decoded._id });
        const encrpytionKey = user.getEncryptionKey();
        const encryptedToken = user.encryptToken(token, encrpytionKey, iv);
        let tokenFound = false;
        for (let i = 0; i < user.tokens.length; i++) {
            const currentToken = user.tokens[i].token;
            if (currentToken === encryptedToken) {
                tokenFound = true;
                break;
            }
        }
        if (!user || !tokenFound) {
            throw new Error("User not found");
        }
        else {
            req.token = token;
            req.encryptedToken = encryptedToken;
            req.user = user;
            next();
        }
    }
    catch (e) {
        console.log(e);
        res.status(401).send({ error: "Error Authenticating" });
    }
});
module.exports = auth;
