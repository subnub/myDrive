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
const env = require("../enviroment/env");
const UserService = require("../services/UserService");
const UserProvider = new UserService();
class UserController {
    constructor() {
    }
    getUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                user.tokens = undefined;
                user.tempTokens = undefined;
                user.password = undefined;
                user.privateKey = undefined;
                user.publicKey = undefined;
                res.send(user);
            }
            catch (e) {
                res.status(500).send(e);
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const { user, token } = yield UserProvider.login(body);
                user.tokens = undefined;
                user.tempTokens = undefined;
                user.password = undefined;
                user.privateKey = undefined;
                user.publicKey = undefined;
                res.status(200).send({ user, token });
            }
            catch (e) {
                const code = e.code || 500;
                console.log(e);
                res.status(code).send(e);
            }
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const token = req.encryptedToken;
                yield UserProvider.logout(user, token);
                res.send();
            }
            catch (e) {
                res.status(500).send(e);
            }
        });
    }
    logoutAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                yield UserProvider.logoutAll(user);
                res.send();
            }
            catch (e) {
                res.status(500).send(e);
            }
        });
    }
    createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (env.createAcctBlocked) {
                return yield res.status(401).send();
            }
            try {
                const { user, token } = yield UserProvider.create(req.body);
                user.tokens = undefined;
                user.tempTokens = undefined;
                user.password = undefined;
                user.privateKey = undefined;
                user.publicKey = undefined;
                res.status(201).send({ user, token });
            }
            catch (e) {
                const code = e.code || 500;
                console.log(e);
                res.status(code).send(e);
            }
        });
    }
    changePassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const oldPassword = req.body.oldPassword;
                const newPassword = req.body.newPassword;
                const newToken = yield UserProvider.changePassword(user, oldPassword, newPassword);
                res.send(newToken);
            }
            catch (e) {
                const code = e.code || 500;
                console.log(e);
                res.status(code).send(e);
            }
        });
    }
}
module.exports = UserController;
