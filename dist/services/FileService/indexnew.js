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
const imageChecker = require("../../utils/imageChecker");
const crypto_1 = __importDefault(require("crypto"));
const videoChecker = require("../../utils/videoChecker");
const mongoose = require("../../db/mongoose");
const conn = mongoose.connection;
const createThumbnail = require("../../services/FileService/utils/createThumbnail");
const thumbnail_1 = __importDefault(require("../../models/thumbnail"));
const ObjectID = require('mongodb').ObjectID;
const NotAuthorizedError_1 = __importDefault(require("../../utils/NotAuthorizedError"));
const NotFoundError_1 = __importDefault(require("../../utils/NotFoundError"));
const env = require("../../enviroment/env");
const jwt = require("jsonwebtoken");
const removeChunks = require("./utils/removeChunks");
const User = require("../../models/user");
const Folder = require("../../models/folder");
const sortBySwitch = require("../../utils/sortBySwitch");
const createQuery = require("../../utils/createQuery");
const ffmpeg = require("fluent-ffmpeg");
const temp = require("temp").track();
const progress = require("progress-stream");
const fs = require("fs");
const index_1 = __importDefault(require("../../db/utils/fileUtils/index"));
const DbUtilFolder = require("../../db/utils/folderUtils");
const dbUtilsFile = new index_1.default();
const dbUtilsFolder = new DbUtilFolder();
class MongoFileService {
    constructor() {
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
        this.removePublicOneTimeLink = (currentFile) => __awaiter(this, void 0, void 0, function* () {
            const fileID = currentFile._id;
            if (currentFile.metadata.linkType === "one") {
                yield dbUtilsFile.removeOneTimePublicLink(fileID);
            }
        });
        this.removeLink = (userID, fileID) => __awaiter(this, void 0, void 0, function* () {
            const file = yield dbUtilsFile.removeLink(fileID, userID);
            if (!file.lastErrorObject.updatedExisting)
                throw new NotFoundError_1.default("Remove Link File Not Found Error");
        });
        this.makePublic = (user, fileID) => __awaiter(this, void 0, void 0, function* () {
            const userID = user._id;
            const token = yield jwt.sign({ _id: userID.toString() }, env.password);
            const file = yield dbUtilsFile.makePublic(fileID, userID, token);
            if (!file.lastErrorObject.updatedExisting)
                throw new NotFoundError_1.default("Make Public File Not Found Error");
            return token;
        });
        this.getPublicInfo = (fileID, tempToken) => __awaiter(this, void 0, void 0, function* () {
            const file = yield dbUtilsFile.getPublicInfo(fileID, tempToken);
            if (!file || !file.metadata.link || file.metadata.link !== tempToken) {
                throw new NotFoundError_1.default("Public Info Not Found");
            }
            else {
                return file;
            }
        });
        this.makeOneTimePublic = (userID, fileID) => __awaiter(this, void 0, void 0, function* () {
            const token = yield jwt.sign({ _id: userID.toString() }, env.password);
            const file = yield dbUtilsFile.makeOneTimePublic(fileID, userID, token);
            if (!file.lastErrorObject.updatedExisting)
                throw new NotFoundError_1.default("Make One Time Public Not Found Error");
            return token;
        });
        this.getFileInfo = (userID, fileID) => __awaiter(this, void 0, void 0, function* () {
            let currentFile = yield dbUtilsFile.getFileInfo(fileID, userID);
            if (!currentFile)
                throw new NotFoundError_1.default("Get File Info Not Found Error");
            const parentID = currentFile.metadata.parent;
            let parentName = "";
            if (parentID === "/") {
                parentName = "Home";
            }
            else {
                const parentFolder = yield Folder.findOne({ "owner": userID, "_id": parentID });
                if (parentFolder) {
                    parentName = parentFolder.name;
                }
                else {
                    parentName = "Unknown";
                }
            }
            return Object.assign(Object.assign({}, currentFile), { parentName });
        });
        this.getQuickList = (userID) => __awaiter(this, void 0, void 0, function* () {
            const quickList = yield dbUtilsFile.getQuickList(userID);
            if (!quickList)
                throw new NotFoundError_1.default("Quick List Not Found Error");
            return quickList;
        });
        this.getList = (userID, query) => __awaiter(this, void 0, void 0, function* () {
            let searchQuery = query.search || "";
            const parent = query.parent || "/";
            let limit = query.limit || 50;
            let sortBy = query.sortby || "DEFAULT";
            const startAt = query.startAt || undefined;
            const startAtDate = query.startAtDate || "0";
            const startAtName = query.startAtName || "";
            sortBy = sortBySwitch(sortBy);
            limit = parseInt(limit);
            const queryObj = createQuery(userID, parent, query.sortby, startAt, startAtDate, searchQuery, startAtName);
            const fileList = yield dbUtilsFile.getList(queryObj, sortBy, limit);
            if (!fileList)
                throw new NotFoundError_1.default("File List Not Found");
            return fileList;
        });
        this.getDownloadToken = (user) => __awaiter(this, void 0, void 0, function* () {
            const tempToken = yield user.generateTempAuthToken();
            if (!tempToken)
                throw new NotAuthorizedError_1.default("Get Download Token Not Authorized Error");
            return tempToken;
        });
        this.getDownloadTokenVideo = (user, cookie) => __awaiter(this, void 0, void 0, function* () {
            if (!cookie)
                throw new NotAuthorizedError_1.default("Get Download Token Video Cookie Not Authorized Error");
            const tempToken = yield user.generateTempAuthTokenVideo(cookie);
            if (!tempToken)
                throw new NotAuthorizedError_1.default("Get Download Token Video Not Authorized Error");
            return tempToken;
        });
        this.removeTempToken = (user, tempToken) => __awaiter(this, void 0, void 0, function* () {
            const key = user.getEncryptionKey();
            const decoded = yield jwt.verify(tempToken, env.password);
            const publicKey = decoded.iv;
            const encryptedToken = user.encryptToken(tempToken, key, publicKey);
            const removedTokenUser = yield dbUtilsFile.removeTempToken(user, encryptedToken);
            if (!removedTokenUser)
                throw new NotFoundError_1.default("Remove Temp Token User Not Found Errors");
            yield removedTokenUser.save();
        });
        this.getSuggestedList = (userID, searchQuery) => __awaiter(this, void 0, void 0, function* () {
            searchQuery = new RegExp(searchQuery, 'i');
            const fileList = yield dbUtilsFile.getFileSearchList(userID, searchQuery);
            const folderList = yield dbUtilsFolder.getFolderSearchList(userID, searchQuery);
            if (!fileList || !folderList)
                throw new NotFoundError_1.default("Suggested List Not Found Error");
            return {
                fileList,
                folderList
            };
        });
        this.renameFile = (userID, fileID, title) => __awaiter(this, void 0, void 0, function* () {
            const file = yield dbUtilsFile.renameFile(fileID, userID, title);
            if (!file.lastErrorObject.updatedExisting)
                throw new NotFoundError_1.default("Rename File Not Found Error");
            return file;
        });
        this.moveFile = (userID, fileID, parentID) => __awaiter(this, void 0, void 0, function* () {
            let parentList = ["/"];
            if (parentID.length !== 1) {
                const parentFile = yield dbUtilsFolder.getFolderInfo(parentID, userID);
                if (!parentFile)
                    throw new NotFoundError_1.default("Rename Parent File Not Found Error");
                const parentList = parentFile.parentList;
                parentList.push(parentID);
            }
            const file = yield dbUtilsFile.moveFile(fileID, userID, parentID, parentList.toString());
            if (!file.lastErrorObject.updatedExisting)
                throw new NotFoundError_1.default("Rename File Not Found Error");
            return file;
        });
        this.deleteFile = (userID, fileID) => __awaiter(this, void 0, void 0, function* () {
            let bucket = new mongoose.mongo.GridFSBucket(conn.db, {
                chunkSizeBytes: 1024 * 255,
            });
            const file = yield dbUtilsFile.getFileInfo(fileID, userID);
            if (!file)
                throw new NotFoundError_1.default("Delete File Not Found Error");
            if (file.metadata.thumbnailID) {
                yield thumbnail_1.default.deleteOne({ _id: file.metadata.thumbnailID });
            }
            if (file.metadata.isVideo && file.metadata.transcoded) {
                try {
                    yield bucket.delete(ObjectID(file.metadata.transcodedID));
                }
                catch (e) {
                    console.log("Could Not Find Transcoded Video");
                }
            }
            yield bucket.delete(ObjectID(fileID));
        });
    }
}
exports.default = MongoFileService;
