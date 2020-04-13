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
const mongoose_1 = __importDefault(require("../../db/mongoose"));
const conn = mongoose_1.default.connection;
const env = require("../../enviroment/env");
const DbUtilFolder = require("../../db/utils/folderUtils");
const index_1 = __importDefault(require("../../db/utils/fileUtils/index"));
const crypto_1 = __importDefault(require("crypto"));
const videoChecker = require("../../utils/videoChecker");
const imageChecker = require("../../utils/imageChecker");
const ObjectID = require('mongodb').ObjectID;
const createThumbnail_1 = __importDefault(require("../FileService/utils/createThumbnail"));
const thumbnail_1 = __importDefault(require("../../models/thumbnail"));
const NotAuthorizedError_1 = __importDefault(require("../../utils/NotAuthorizedError"));
const user_1 = __importDefault(require("../../models/user"));
const removeChunks = require("../FileService/utils/removeChunks");
const dbUtilsFile = new index_1.default();
const dbUtilsFolder = new DbUtilFolder();
class MongoService {
    constructor() {
        this.uploadFile = (user, busboy, req) => {
            return new Promise((resolve, reject) => {
                const password = user.getEncryptionKey();
                let bucketStream;
                const initVect = crypto_1.default.randomBytes(16);
                const CIPHER_KEY = crypto_1.default.createHash('sha256').update(password).digest();
                const cipher = crypto_1.default.createCipheriv('aes256', CIPHER_KEY, initVect);
                cipher.on("error", (e) => __awaiter(this, void 0, void 0, function* () {
                    yield removeChunks(bucketStream);
                    reject({
                        message: "File service upload cipher error",
                        exception: e,
                        code: 500
                    });
                }));
                const formData = new Map();
                busboy.on("error", (e) => __awaiter(this, void 0, void 0, function* () {
                    yield removeChunks(bucketStream);
                    reject({
                        message: "File service upload busboy error",
                        exception: e,
                        code: 500
                    });
                }));
                busboy.on("file", (_, file, filename) => __awaiter(this, void 0, void 0, function* () {
                    const parent = formData.get("parent") || "/";
                    const parentList = formData.get("parentList") || "/";
                    const size = formData.get("size") || "";
                    let hasThumbnail = false;
                    let thumbnailID = "";
                    const isVideo = videoChecker(filename);
                    const metadata = {
                        owner: user._id,
                        parent,
                        parentList,
                        hasThumbnail,
                        thumbnailID,
                        isVideo,
                        size,
                        IV: initVect
                    };
                    let bucket = new mongoose_1.default.mongo.GridFSBucket(conn.db, {
                        chunkSizeBytes: 1024 * 255
                    });
                    bucketStream = bucket.openUploadStream(filename, { metadata });
                    bucketStream.on("error", (e) => __awaiter(this, void 0, void 0, function* () {
                        yield removeChunks(bucketStream);
                        reject({
                            message: "Cannot upload file to database",
                            exception: e,
                            code: 500
                        });
                    }));
                    req.on("aborted", () => __awaiter(this, void 0, void 0, function* () {
                        console.log("Upload Request Cancelling...");
                        yield removeChunks(bucketStream);
                    }));
                    file.pipe(cipher).pipe(bucketStream);
                    bucketStream.on("finish", (file) => {
                        const imageCheck = imageChecker(filename);
                        if (file.length < 15728640 && imageCheck) {
                            createThumbnail_1.default(file, filename, user).then((updatedFile) => {
                                resolve(updatedFile);
                            });
                        }
                        else {
                            resolve(file);
                        }
                    });
                })).on("field", (field, val) => {
                    formData.set(field, val);
                });
            });
        };
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
        this.getThumbnail = (user, id) => __awaiter(this, void 0, void 0, function* () {
            const password = user.getEncryptionKey();
            const thumbnail = yield thumbnail_1.default.findById(id);
            if (thumbnail.owner !== user._id.toString()) {
                throw new NotAuthorizedError_1.default('Thumbnail Unauthorized Error');
            }
            const iv = thumbnail.data.slice(0, 16);
            const chunk = thumbnail.data.slice(16);
            const CIPHER_KEY = crypto_1.default.createHash('sha256').update(password).digest();
            const decipher = crypto_1.default.createDecipheriv("aes256", CIPHER_KEY, iv);
            const decryptedThumbnail = Buffer.concat([decipher.update(chunk), decipher.final()]);
            return decryptedThumbnail;
        });
        this.getFullThumbnail = (user, fileID, res) => {
            return new Promise((resolve, reject) => {
                const userID = user._id;
                dbUtilsFile.getFileInfo(fileID, userID).then((file) => {
                    if (!file) {
                        reject({
                            code: 401,
                            message: "File For Full Thumbnail Not Found",
                            exception: undefined
                        });
                    }
                    const bucket = new mongoose_1.default.mongo.GridFSBucket(conn.db, {
                        chunkSizeBytes: 1024 * 255,
                    });
                    const password = user.getEncryptionKey();
                    const IV = file.metadata.IV.buffer;
                    const readStream = bucket.openDownloadStream(ObjectID(fileID));
                    readStream.on("error", (e) => {
                        reject({
                            code: 500,
                            message: "File service Full Thumbnail stream error",
                            exception: e
                        });
                    });
                    const CIPHER_KEY = crypto_1.default.createHash('sha256').update(password).digest();
                    const decipher = crypto_1.default.createDecipheriv('aes256', CIPHER_KEY, IV);
                    decipher.on("error", (e) => {
                        reject({
                            code: 500,
                            message: "File service Full Thumbnail decipher error",
                            exception: e
                        });
                    });
                    res.set('Content-Type', 'binary/octet-stream');
                    res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');
                    res.set('Content-Length', file.metadata.size);
                    readStream.pipe(decipher).pipe(res).on("finish", () => __awaiter(this, void 0, void 0, function* () {
                        console.log("Sent Full Thumbnail");
                        resolve();
                    }));
                });
            });
        };
        this.getPublicDownload = (fileID, tempToken, res) => {
            return new Promise((resolve, reject) => {
                dbUtilsFile.getPublicFile(fileID).then((file) => __awaiter(this, void 0, void 0, function* () {
                    if (!file || !file.metadata.link || file.metadata.link !== tempToken) {
                        reject({
                            code: 401,
                            message: "File not public/Not found",
                            exception: undefined
                        });
                    }
                    else {
                        const user = yield user_1.default.findById(file.metadata.owner);
                        const bucket = new mongoose_1.default.mongo.GridFSBucket(conn.db, {
                            chunkSizeBytes: 1024 * 255,
                        });
                        const password = user.getEncryptionKey();
                        const IV = file.metadata.IV.buffer;
                        const readStream = bucket.openDownloadStream(ObjectID(fileID));
                        readStream.on("error", (e) => {
                            reject({
                                code: 500,
                                message: "File service public download decipher error",
                                exception: e
                            });
                        });
                        const CIPHER_KEY = crypto_1.default.createHash('sha256').update(password).digest();
                        const decipher = crypto_1.default.createDecipheriv('aes256', CIPHER_KEY, IV);
                        decipher.on("error", (e) => {
                            reject({
                                code: 500,
                                message: "File service public download decipher error",
                                exception: e
                            });
                        });
                        res.set('Content-Type', 'binary/octet-stream');
                        res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');
                        res.set('Content-Length', file.metadata.size.toString());
                        readStream.pipe(decipher).pipe(res).on("finish", () => __awaiter(this, void 0, void 0, function* () {
                            if (file.metadata.linkType === "one") {
                                console.log("removing public link");
                                yield dbUtilsFile.removeOneTimePublicLink(fileID);
                            }
                            resolve();
                        }));
                    }
                }));
            });
        };
    }
}
exports.default = MongoService;
