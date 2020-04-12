"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("../../db/mongoose"));
const conn = mongoose_1.default.connection;
const env = require("../../enviroment/env");
const DbUtilFolder = require("../../db/utils/folderUtils");
const index_1 = __importDefault(require("../../db/utils/fileUtils/index"));
const crypto_1 = __importDefault(require("crypto"));
const ObjectID = require('mongodb').ObjectID;
const dbUtilsFile = new index_1.default();
const dbUtilsFolder = new DbUtilFolder();
class MongoService {
    constructor() {
        this.downloadFile = (user, fileID, res) => {
            return new Promise((resolve, reject) => {
                dbUtilsFile.getFileInfo(fileID, user._id).then((currentFile) => {
                    if (!currentFile) {
                        reject({
                            code: 401,
                            message: "Download File Not Found Error",
                            exception: undefined
                        });
                    }
                    else {
                        const password = user.getEncryptionKey();
                        const bucket = new mongoose_1.default.mongo.GridFSBucket(conn.db);
                        const IV = currentFile.metadata.IV.buffer;
                        const readStream = bucket.openDownloadStream(ObjectID(fileID));
                        readStream.on("error", (e) => {
                            reject({
                                code: 500,
                                message: "File service download decipher error",
                                exception: e
                            });
                        });
                        const CIPHER_KEY = crypto_1.default.createHash('sha256').update(password).digest();
                        const decipher = crypto_1.default.createDecipheriv('aes256', CIPHER_KEY, IV);
                        decipher.on("error", (e) => {
                            reject({
                                code: 500,
                                message: "File service download decipher error",
                                exception: e
                            });
                        });
                        res.set('Content-Type', 'binary/octet-stream');
                        res.set('Content-Disposition', 'attachment; filename="' + currentFile.filename + '"');
                        res.set('Content-Length', currentFile.metadata.size.toString());
                        readStream.pipe(decipher).pipe(res).on("finish", () => {
                            resolve();
                        });
                    }
                });
            });
        };
    }
}
exports.default = MongoService;
