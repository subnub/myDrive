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
const disk = require('diskusage');
class StorageController {
    constructor() {
    }
    getStorageInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const info = yield disk.check(env.root);
                res.send(info);
            }
            catch (e) {
                console.log(e);
                res.status(500).send(e);
            }
        });
    }
}
module.exports = StorageController;
