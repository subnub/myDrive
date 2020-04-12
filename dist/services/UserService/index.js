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
const User = require("../../models/user");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const NotFoundError = require("../../utils/NotFoundError");
const InternalServerError = require("../../utils/InternalServerError");
const NotAuthorizedError = require("../../utils/NotAuthorizedError");
const UserService = function () {
    this.login = (userData) => __awaiter(this, void 0, void 0, function* () {
        const email = userData.email;
        const password = userData.password;
        const user = yield User.findByCreds(email, password);
        const token = yield user.generateAuthToken();
        if (!user || !token)
            throw new NotFoundError("Login User Not Found Error");
        return { user, token };
    });
    this.logout = (user, userToken) => __awaiter(this, void 0, void 0, function* () {
        user.tokens = user.tokens.filter((token) => {
            return token.token !== userToken;
        });
        yield user.save();
    });
    this.logoutAll = (user) => __awaiter(this, void 0, void 0, function* () {
        user.tokens = [];
        user.tempTokens = [];
        yield user.save();
    });
    this.create = (userData) => __awaiter(this, void 0, void 0, function* () {
        console.log("Create");
        const user = new User(userData);
        yield user.save();
        yield user.generateEncryptionKeys();
        const token = yield user.generateAuthToken();
        if (!user || !token)
            throw new InternalServerError("Could Not Create New User Error");
        return { user, token };
    });
    this.changePassword = (user, oldPassword, newPassword) => __awaiter(this, void 0, void 0, function* () {
        const isMatch = yield bcrypt.compare(oldPassword, user.password);
        if (!isMatch)
            throw new NotAuthorizedError("Change Passwords Do Not Match Error");
        const encryptionKey = user.getEncryptionKey();
        user.password = newPassword;
        user.tokens = [];
        user.tempTokens = [];
        yield user.save();
        yield user.changeEncryptionKey(encryptionKey);
        const newToken = yield user.generateAuthToken();
        return newToken;
    });
};
module.exports = UserService;
