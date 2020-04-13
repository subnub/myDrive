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
const createThumbnail = require("./utils/createThumbnail.ss");
const Thumbnail = require("../../models/thumbnail");
const ObjectID = require('mongodb').ObjectID;
const NotAuthorizedError = require("../../utils/NotAuthorizedError");
const NotFoundError = require("../../utils/NotFoundError");
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
const DbUtilFile = require("../../db/utils/fileUtils");
const DbUtilFolder = require("../../db/utils/folderUtils");
const dbUtilsFile = new DbUtilFile();
const dbUtilsFolder = new DbUtilFolder();
const FileService = function () {
    this.upload = (user, busboy, req) => {
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
            busboy.on("file", (fieldname, file, filename) => __awaiter(this, void 0, void 0, function* () {
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
                let bucket = new mongoose.mongo.GridFSBucket(conn.db, {
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
                bucketStream.on("finish", (file) => __awaiter(this, void 0, void 0, function* () {
                    const imageCheck = imageChecker(filename);
                    if (file.length < 15728640 && imageCheck) {
                        let updatedFile = yield createThumbnail(file, filename, user);
                        resolve(updatedFile);
                    }
                    else {
                        resolve(file);
                    }
                }));
            })).on("field", (field, val) => {
                formData.set(field, val);
            });
        });
    };
    this.getThumbnail = (user, id) => __awaiter(this, void 0, void 0, function* () {
        const password = user.getEncryptionKey();
        const thumbnail = yield Thumbnail.findById(id);
        if (user._id.toString() !== thumbnail.owner) {
            throw new NotAuthorizedError("Thumbnail Unauthorized Error");
        }
        const iv = thumbnail.data.slice(0, 16);
        const chunk = thumbnail.data.slice(16);
        const CIPHER_KEY = crypto_1.default.createHash('sha256').update(password).digest();
        const decipher = crypto_1.default.createDecipheriv("aes256", CIPHER_KEY, iv);
        const decryptedThumbnail = Buffer.concat([decipher.update(chunk), decipher.final()]);
        //console.log("decry", decryptedThumbnail);
        return decryptedThumbnail;
    });
    this.getFullThumbnail = (user, fileID, res) => __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const userID = user._id;
            dbUtilsFile.getFileInfo(fileID, userID).then((file) => __awaiter(this, void 0, void 0, function* () {
                if (!file) {
                    reject({
                        code: 401,
                        message: "File For Full Thumbnail Not Found",
                        exception: undefined
                    });
                }
                const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
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
            }));
        });
    });
    this.publicDownload = (ID, tempToken, res) => {
        return new Promise((resolve, reject) => {
            dbUtilsFile.getPublicFile(ID).then((file) => __awaiter(this, void 0, void 0, function* () {
                if (!file || !file.metadata.link || file.metadata.link !== tempToken) {
                    reject({
                        code: 401,
                        message: "File not public/Not found",
                        exception: undefined
                    });
                }
                else {
                    const user = yield User.findById(file.metadata.owner);
                    const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
                        chunkSizeBytes: 1024 * 255,
                    });
                    const password = user.getEncryptionKey();
                    const IV = file.metadata.IV.buffer;
                    const readStream = bucket.openDownloadStream(ObjectID(ID));
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
                    res.set('Content-Length', file.metadata.size);
                    readStream.pipe(decipher).pipe(res).on("finish", () => __awaiter(this, void 0, void 0, function* () {
                        console.log("removing public link");
                        yield this.removePublicOneTimeLink(file);
                        resolve();
                    }));
                }
            }));
        });
    };
    this.removePublicOneTimeLink = (currentFile) => __awaiter(this, void 0, void 0, function* () {
        const ID = currentFile._id;
        if (currentFile.metadata.linkType === "one") {
            yield dbUtilsFile.removeOneTimePublicLink(ID);
        }
    });
    this.removeLink = (userID, fileID) => __awaiter(this, void 0, void 0, function* () {
        const file = yield dbUtilsFile.removeLink(fileID, userID);
        if (!file.lastErrorObject.updatedExisting)
            throw new NotFoundError("Remove Link File Not Found Error");
    });
    this.makePublic = (user, fileID) => __awaiter(this, void 0, void 0, function* () {
        const userID = user._id;
        const token = yield jwt.sign({ _id: userID.toString() }, env.password);
        const file = yield dbUtilsFile.makePublic(fileID, userID, token, "public");
        if (!file.lastErrorObject.updatedExisting)
            throw new NotFoundError("Make Public File Not Found Error");
        return token;
    });
    this.getPublicInfo = (fileID, tempToken) => __awaiter(this, void 0, void 0, function* () {
        const file = yield dbUtilsFile.getPublicInfo(fileID, tempToken);
        if (!file || !file.metadata.link || file.metadata.link !== tempToken) {
            throw new NotFoundError("Public Info Not Found");
        }
        else {
            return file;
        }
    });
    this.makeOneTimePublic = (userID, fileID) => __awaiter(this, void 0, void 0, function* () {
        const token = yield jwt.sign({ _id: userID.toString() }, env.password);
        const file = yield dbUtilsFile.makeOneTimePublic(fileID, userID, token);
        if (!file.lastErrorObject.updatedExisting)
            throw new NotFoundError("Make One Time Public Not Found Error");
        return token;
    });
    this.getFileInfo = (userID, fileID) => __awaiter(this, void 0, void 0, function* () {
        let currentFile = yield dbUtilsFile.getFileInfo(fileID, userID);
        if (!currentFile)
            throw new NotFoundError("Get File Info Not Found Error");
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
            throw new NotFoundError("Quick List Not Found Error");
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
            throw new NotFoundError("File List Not Found");
        return fileList;
    });
    this.getDownloadToken = (user) => __awaiter(this, void 0, void 0, function* () {
        const tempToken = yield user.generateTempAuthToken();
        if (!tempToken)
            throw new NotAuthorizedError("Get Download Token Not Authorized Error");
        return tempToken;
    });
    this.getDownloadTokenVideo = (user, cookie) => __awaiter(this, void 0, void 0, function* () {
        if (!cookie)
            throw new NotAuthorizedError("Get Download Token Video Cookie Not Authorized Error");
        const tempToken = yield user.generateTempAuthTokenVideo(cookie);
        if (!tempToken)
            throw new NotAuthorizedError("Get Download Token Video Not Authorized Error");
        return tempToken;
    });
    this.removeTempToken = (user, tempToken) => __awaiter(this, void 0, void 0, function* () {
        const key = user.getEncryptionKey();
        const decoded = yield jwt.verify(tempToken, env.password);
        const publicKey = decoded.iv;
        const encryptedToken = user.encryptToken(tempToken, key, publicKey);
        const removedTokenUser = yield dbUtilsFile.removeTempToken(user, encryptedToken);
        if (!removedTokenUser)
            throw new NotFoundError("Remove Temp Token User Not Found Errors");
        yield removedTokenUser.save();
    });
    this.transcodeVideo = (user, body) => {
        return new Promise((resolve, reject) => {
            const id = body.file._id;
            const userID = user._id;
            conn.db.collection("fs.files")
                .findOne({ "_id": ObjectID(id), "metadata.owner": userID }).then((currentFile) => {
                if (!currentFile) {
                    reject({
                        message: "Transcode Video Not Found Error",
                        exception: undefined,
                        code: 401
                    });
                }
                else {
                    const password = user.getEncryptionKey(); //env.key;
                    const IV = currentFile.metadata.IV.buffer;
                    const bucket = new mongoose.mongo.GridFSBucket(conn.db);
                    const readStream = bucket.openDownloadStream(ObjectID(id));
                    readStream.on("error", (e) => {
                        reject({
                            message: "File service transcode video stream error",
                            exception: e,
                            code: 500
                        });
                    });
                    const CIPHER_KEY = crypto_1.default.createHash('sha256').update(password).digest();
                    const decipher = crypto_1.default.createDecipheriv('aes256', CIPHER_KEY, IV);
                    decipher.on("error", (e) => {
                        reject({
                            message: "File service transcode video decipher error",
                            exception: e,
                            code: 500
                        });
                    });
                    const tempStream = temp.createWriteStream();
                    tempStream.on("error", (e) => {
                        reject({
                            message: "File service transcode video temp error",
                            exception: e,
                            code: 500
                        });
                    });
                    readStream.pipe(decipher).pipe(tempStream).on("finish", () => {
                        const writeBucket = new mongoose.mongo.GridFSBucket(conn.db, {
                            bucketName: "videos",
                        });
                        const gfsWrite = writeBucket.openUploadStream(currentFile.filename, {
                            _id: id,
                        });
                        gfsWrite.on("error", (e) => {
                            reject({
                                message: "File service transcode video write stream error",
                                exception: e,
                                code: 500
                            });
                        });
                        const initVect = crypto_1.default.randomBytes(16);
                        const cipher = crypto_1.default.createCipheriv('aes256', CIPHER_KEY, initVect);
                        cipher.on("error", (e) => {
                            reject({
                                message: "File service transcode video cipher write error",
                                exception: e,
                                code: 500
                            });
                        });
                        const str = progress({ time: 100 });
                        str.on("progress", () => {
                        });
                        str.on("finish", () => {
                        });
                        const tempStream2 = temp.createWriteStream();
                        tempStream2.on("error", (e) => {
                            reject({
                                message: "File service transcode video temp write error",
                                exception: e,
                                code: 500
                            });
                        });
                        const ffmpegCommand = ffmpeg()
                            .input(tempStream.path).outputOptions(['-movflags frag_keyframe+empty_moov', '-movflags +faststart'])
                            .outputFormat('mp4').on("error", (err, stdout, stderr) => {
                            console.log('An error occurred: ' + err.message, err, stderr);
                            reject({
                                message: "Video Transcode Failed Error",
                                exception: err.message,
                                code: 500
                            });
                        })
                            .videoCodec('libx264')
                            .audioBitrate('128k')
                            .videoBitrate(8000, true)
                            .pipe(tempStream2).on("finish", () => {
                            fs.createReadStream(tempStream2.path).pipe(cipher).pipe(gfsWrite).on("finish", (file) => __awaiter(this, void 0, void 0, function* () {
                                console.log("transcode finished");
                                yield conn.db.collection("fs.files")
                                    .findOneAndUpdate({ "_id": ObjectID(id) }, { "$set": { "metadata.transcoded": true, "metadata.transcodedIV": initVect, "metadata.transcoded_size": tempStream2.bytesWritten, "metadata.transcodedID": file._id } });
                                resolve();
                            })).on("error", (e) => {
                                reject({
                                    message: "File service transcode read stream error",
                                    exception: e,
                                    code: 500
                                });
                            });
                        });
                        ffmpegCommand.on("error", (e) => {
                            reject({
                                message: "File service FFMPEG error",
                                exception: e,
                                code: 500
                            });
                        });
                    });
                }
            });
        });
    };
    this.removeTranscodeVideo = (userID, fileID) => __awaiter(this, void 0, void 0, function* () {
        const parentFile = yield dbUtilsFile.getFileInfo(fileID, userID);
        const transcodedVideoID = parentFile.metadata.transcodedID;
        const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
            bucketName: "videos"
        });
        try {
            yield bucket.delete(ObjectID(transcodedVideoID));
        }
        catch (e) {
            console.log("Could Not Find Transcoded Video");
        }
        const file = yield dbUtilsFile.removeTranscodeVideo(fileID, userID);
        if (!file)
            throw new NotFoundError("Remove Transcode Video Error");
    });
    this.streamTranscodedVideo = (userID, fileID, headers, res) => {
        return new Promise((resolve, reject) => {
            dbUtilsFile.getFileInfo(fileID, userID).then((file) => {
                if (!file) {
                    reject({
                        code: 401,
                        message: "Stream Transcoded File Not Found",
                        exception: undefined
                    });
                }
                else {
                    const fileSize = file.metadata.transcoded_size;
                    const transcodedVideoID = file.metadata.transcodedID;
                    const password = user.getEncryptionKey(); //env.key;
                    const range = headers.range;
                    const parts = range.replace(/bytes=/, "").split("-");
                    const start = parseInt(parts[0], 10);
                    const end = parts[1]
                        ? parseInt(parts[1], 10)
                        : fileSize - 1;
                    const chunksize = (end - start) + 1;
                    const IV = file.metadata.transcodedIV.buffer;
                    let head = {
                        'Content-Range': 'bytes ' + start + '-' + end + '/' + fileSize,
                        'Accept-Ranges': 'bytes',
                        'Content-Length': chunksize,
                        'Content-Type': 'video/mp4'
                    };
                    const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
                        bucketName: "videos",
                        chunkSizeBytes: chunksize
                    });
                    const readStream = bucket.openDownloadStream(ObjectID(transcodedVideoID), {
                        start: start,
                        end: end
                    });
                    readStream.on("error", (e) => {
                        reject({
                            code: 500,
                            message: "File service transcode video stream error",
                            exception: e
                        });
                    });
                    const CIPHER_KEY = crypto_1.default.createHash('sha256').update(password).digest();
                    const decipher = crypto_1.default.createDecipheriv('aes256', CIPHER_KEY, IV);
                    decipher.setAutoPadding(false);
                    decipher.on("error", (e) => {
                        reject({
                            code: 500,
                            message: "File service transcode video decipher error",
                            exception: e
                        });
                    });
                    res.writeHead(206, head);
                    readStream.pipe(decipher).pipe(res).on("finish", () => {
                        resolve();
                    });
                }
            });
        });
    };
    this.streamVideo = (user, fileID, headers, res) => {
        return new Promise((resolve, reject) => {
            const userID = user._id;
            dbUtilsFile.getFileInfo(fileID, userID).then((currentFile) => {
                if (!currentFile) {
                    reject({
                        code: 401,
                        message: "Video Steam Not Found Error",
                        exception: undefined
                    });
                }
                else {
                    const password = user.getEncryptionKey();
                    const fileSize = currentFile.metadata.size;
                    const range = headers.range;
                    const parts = range.replace(/bytes=/, "").split("-");
                    let start = parseInt(parts[0], 10);
                    let end = parts[1]
                        ? parseInt(parts[1], 10)
                        : fileSize - 1;
                    const chunksize = (end - start) + 1;
                    const IV = currentFile.metadata.IV.buffer;
                    let head = {
                        'Content-Range': 'bytes ' + start + '-' + end + '/' + fileSize,
                        'Accept-Ranges': 'bytes',
                        'Content-Length': chunksize,
                        'Content-Type': 'video/mp4'
                    };
                    const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
                        chunkSizeBytes: 1024
                    });
                    const readStream = bucket.openDownloadStream(ObjectID(fileID), {
                        start: start,
                        end: end.length
                    });
                    readStream.on("error", (e) => {
                        reject({
                            code: 500,
                            message: "File service stream video stream error",
                            exception: e
                        });
                    });
                    const CIPHER_KEY = crypto_1.default.createHash('sha256').update(password).digest();
                    const decipher = crypto_1.default.createDecipheriv('aes256', CIPHER_KEY, IV);
                    decipher.on("error", (e) => {
                        reject({
                            code: 500,
                            message: "File service stream video decipher error",
                            exception: e
                        });
                    });
                    res.writeHead(206, head);
                    readStream.pipe(decipher).pipe(res).on("finish", () => {
                        resolve();
                    });
                }
            });
        });
    };
    this.downloadFile = (user, fileID, res) => {
        return new Promise((resolve, reject) => {
            const userID = user._id;
            dbUtilsFile.getFileInfo(fileID, userID).then((file) => {
                if (!file) {
                    reject({
                        code: 401,
                        message: "Download File Not Found Error",
                        exception: undefined
                    });
                }
                else {
                    const password = user.getEncryptionKey();
                    const bucket = new mongoose.mongo.GridFSBucket(conn.db);
                    const IV = file.metadata.IV.buffer;
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
                    res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');
                    res.set('Content-Length', file.metadata.size);
                    readStream.pipe(decipher).pipe(res).on("finish", () => {
                        resolve();
                    });
                }
            });
        });
    };
    this.getSuggestedList = (userID, searchQuery) => __awaiter(this, void 0, void 0, function* () {
        searchQuery = new RegExp(searchQuery, 'i');
        const fileList = yield dbUtilsFile.getFileSearchList(userID, searchQuery);
        const folderList = yield dbUtilsFolder.getFolderSearchList(userID, searchQuery);
        if (!fileList || !folderList)
            throw new NotFoundError("Suggested List Not Found Error");
        return {
            fileList,
            folderList
        };
    });
    this.renameFile = (userID, fileID, title) => __awaiter(this, void 0, void 0, function* () {
        const file = yield dbUtilsFile.renameFile(fileID, userID, title);
        if (!file.lastErrorObject.updatedExisting)
            throw new NotFoundError("Rename File Not Found Error");
        return file;
    });
    this.moveFile = (userID, fileID, parentID) => __awaiter(this, void 0, void 0, function* () {
        let parentList = ["/"];
        if (parentID.length !== 1) {
            const parentFile = yield dbUtilsFolder.getFolderInfo(parentID, userID);
            if (!parentFile)
                throw new NotFoundError("Rename Parent File Not Found Error");
            const parentList = parentFile.parentList;
            parentList.push(parentID);
        }
        const file = yield dbUtilsFile.moveFile(fileID, userID, parentID, parentList.toString());
        if (!file.lastErrorObject.updatedExisting)
            throw new NotFoundError("Rename File Not Found Error");
        return file;
    });
    this.deleteFile = (userID, fileID) => __awaiter(this, void 0, void 0, function* () {
        let bucket = new mongoose.mongo.GridFSBucket(conn.db, {
            chunkSizeBytes: 1024 * 255,
        });
        const videoBucket = new mongoose.mongo.GridFSBucket(conn.db, {
            bucketName: "videos"
        });
        const file = yield dbUtilsFile.getFileInfo(fileID, userID);
        if (!file)
            throw new NotFoundError("Delete File Not Found Error");
        if (file.metadata.thumbnailID) {
            yield Thumbnail.deleteOne({ _id: file.metadata.thumbnailID });
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
};
module.exports = FileService;
