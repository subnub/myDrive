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
const DbUtilFolder = require("../../db/utils/folderUtils");
const index_1 = __importDefault(require("../../db/utils/fileUtils/index"));
const crypto_1 = __importDefault(require("crypto"));
const videoChecker_1 = __importDefault(require("../../utils/videoChecker"));
const imageChecker_1 = __importDefault(require("../../utils/imageChecker"));
const mongodb_1 = require("mongodb");
const createThumbnail_1 = __importDefault(require("../FileService/utils/createThumbnail"));
const thumbnail_1 = __importDefault(require("../../models/thumbnail"));
const NotAuthorizedError_1 = __importDefault(require("../../utils/NotAuthorizedError"));
const NotFoundError_1 = __importDefault(require("../../utils/NotFoundError"));
const awaitStream_1 = __importDefault(require("./utils/awaitStream"));
const awaitUploadStream_1 = __importDefault(require("./utils/awaitUploadStream"));
const user_1 = __importDefault(require("../../models/user"));
const getBusboyData_1 = __importDefault(require("./utils/getBusboyData"));
const dbUtilsFile = new index_1.default();
const dbUtilsFolder = new DbUtilFolder();
class MongoService {
    constructor() {
        this.uploadFile = (user, busboy, req) => __awaiter(this, void 0, void 0, function* () {
            const password = user.getEncryptionKey();
            if (!password)
                throw new NotAuthorizedError_1.default("Invalid Encryption Key");
            let bucketStream;
            const initVect = crypto_1.default.randomBytes(16);
            const CIPHER_KEY = crypto_1.default.createHash('sha256').update(password).digest();
            const cipher = crypto_1.default.createCipheriv('aes256', CIPHER_KEY, initVect);
            const { file, filename, formData } = yield getBusboyData_1.default(busboy);
            const parent = formData.get("parent") || "/";
            const parentList = formData.get("parentList") || "/";
            const size = formData.get("size") || "";
            let hasThumbnail = false;
            let thumbnailID = "";
            const isVideo = videoChecker_1.default(filename);
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
            let bucket = new mongoose_1.default.mongo.GridFSBucket(conn.db);
            bucketStream = bucket.openUploadStream(filename, { metadata });
            const finishedFile = yield awaitUploadStream_1.default(file.pipe(cipher), bucketStream, req);
            const imageCheck = imageChecker_1.default(filename);
            if (finishedFile.length < 15728640 && imageCheck) {
                const updatedFile = yield createThumbnail_1.default(finishedFile, filename, user);
                return updatedFile;
            }
            else {
                return finishedFile;
            }
            // file.pipe(cipher).pipe(bucketStream);
            //         bucketStream.on("finish", (finishedFile: FileInterface) => {
            //             const imageCheck = imageChecker(filename);
            //             if (finishedFile.length < 15728640 && imageCheck) {
            //                 createThumbnail(finishedFile, filename, user).then((updatedFile: FileInterface) => {
            //                     resolve(updatedFile);
            //                 })
            //             } else {
            //                 resolve(finishedFile);
            //             }
            //         })
            // return new Promise<FileInterface>((resolve, reject) => {
            //     const password = user.getEncryptionKey(); 
            //     if (!password) throw new NotAuthorizedError("Invalid Encryption Key")
            //     let bucketStream: GridFSBucketWriteStream;
            //     const initVect = crypto.randomBytes(16);
            //     const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        
            //     const cipher = crypto.createCipheriv('aes256', CIPHER_KEY, initVect);
            //     const formData = new Map();
            //     busboy.on("file", async(_: string, file: Stream, filename: string) => {
            //         const parent = formData.get("parent") || "/"
            //         const parentList = formData.get("parentList") || "/";
            //         const size = formData.get("size") || ""
            //         let hasThumbnail = false;
            //         let thumbnailID = ""
            //         const isVideo = videoChecker(filename)
            //         const metadata = {
            //                             owner: user._id,
            //                             parent,
            //                             parentList,
            //                             hasThumbnail,
            //                             thumbnailID,
            //                             isVideo,
            //                             size,
            //                             IV: initVect
            //                         }
            //         let bucket = new mongoose.mongo.GridFSBucket(conn.db, {
            //                             chunkSizeBytes: 1024 * 255
            //                         });
            //         bucketStream = bucket.openUploadStream(filename, {metadata})
            //         bucketStream.on("error", async(e: Error) => {
            //             await removeChunks(bucketStream);
            //             reject({
            //                 message: "Cannot upload file to database",
            //                 exception: e,
            //                 code: 500
            //             })
            //         })
            //         req.on("aborted", async() => {
            //             console.log("Upload Request Cancelling...");
            //             await removeChunks(bucketStream);
            //         })
            //         file.pipe(cipher).pipe(bucketStream);
            //         bucketStream.on("finish", (finishedFile: FileInterface) => {
            //             const imageCheck = imageChecker(filename);
            //             if (finishedFile.length < 15728640 && imageCheck) {
            //                 createThumbnail(finishedFile, filename, user).then((updatedFile: FileInterface) => {
            //                     resolve(updatedFile);
            //                 })
            //             } else {
            //                 resolve(finishedFile);
            //             }
            //         })
            //     }).on("field", (field: any, val: any) => {
            //         formData.set(field, val)
            //     })
            // })
        });
        this.downloadFile = (user, fileID, res) => __awaiter(this, void 0, void 0, function* () {
            const currentFile = yield dbUtilsFile.getFileInfo(fileID, user._id);
            if (!currentFile)
                throw new NotFoundError_1.default("Download File Not Found");
            const password = user.getEncryptionKey();
            if (!password)
                throw new NotAuthorizedError_1.default("Invalid Encryption Key");
            const bucket = new mongoose_1.default.mongo.GridFSBucket(conn.db);
            const IV = currentFile.metadata.IV.buffer;
            const readStream = bucket.openDownloadStream(new mongodb_1.ObjectID(fileID));
            const CIPHER_KEY = crypto_1.default.createHash('sha256').update(password).digest();
            const decipher = crypto_1.default.createDecipheriv('aes256', CIPHER_KEY, IV);
            res.set('Content-Type', 'binary/octet-stream');
            res.set('Content-Disposition', 'attachment; filename="' + currentFile.filename + '"');
            res.set('Content-Length', currentFile.metadata.size.toString());
            yield awaitStream_1.default(readStream.pipe(decipher), res);
            // return new Promise((resolve, reject) => {
            //     dbUtilsFile.getFileInfo(fileID, user._id).then((currentFile: FileInterface) => {
            //         if (!currentFile) {
            //             reject({
            //                 code: 401, 
            //                 message: "Download File Not Found Error",
            //                 exception: undefined
            //             })
            //         } else {
            //             const password = user.getEncryptionKey();
            //             if (!password) throw new NotAuthorizedError("Invalid Encryption Key")
            //             const bucket = new mongoose.mongo.GridFSBucket(conn.db);
            //             const IV = currentFile.metadata.IV.buffer
            //             const readStream = bucket.openDownloadStream(new ObjectID(fileID));
            //             readStream.on("error", (e: Error) => {
            //                 reject({
            //                     code: 500, 
            //                     message: "File service download decipher error",
            //                     exception: e
            //                 })
            //             })
            //             const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        
            //             const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, IV);
            //             decipher.on("error", (e) => {
            //                 reject({
            //                     code: 500, 
            //                     message: "File service download decipher error",
            //                     exception: e
            //                 })
            //             })
            //             res.set('Content-Type', 'binary/octet-stream');
            //             res.set('Content-Disposition', 'attachment; filename="' + currentFile.filename + '"');
            //             res.set('Content-Length', currentFile.metadata.size.toString()); 
            //             readStream.pipe(decipher).pipe(res).on("finish", () => {
            //                 resolve();
            //             });
            //         }
            //     })
            // })
        });
        this.getThumbnail = (user, id) => __awaiter(this, void 0, void 0, function* () {
            const password = user.getEncryptionKey();
            if (!password)
                throw new NotAuthorizedError_1.default("Invalid Encryption Key");
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
        this.getFullThumbnail = (user, fileID, res) => __awaiter(this, void 0, void 0, function* () {
            const userID = user._id;
            const file = yield dbUtilsFile.getFileInfo(fileID, userID);
            if (!file)
                throw new NotFoundError_1.default("File Thumbnail Not Found");
            const bucket = new mongoose_1.default.mongo.GridFSBucket(conn.db);
            const password = user.getEncryptionKey();
            const IV = file.metadata.IV.buffer;
            if (!password)
                throw new NotAuthorizedError_1.default("Invalid Encryption Key");
            const readStream = bucket.openDownloadStream(new mongodb_1.ObjectID(fileID));
            const CIPHER_KEY = crypto_1.default.createHash('sha256').update(password).digest();
            const decipher = crypto_1.default.createDecipheriv('aes256', CIPHER_KEY, IV);
            res.set('Content-Type', 'binary/octet-stream');
            res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');
            res.set('Content-Length', file.metadata.size.toString());
            console.log("Sending Full Thumbnail...");
            yield awaitStream_1.default(readStream.pipe(decipher), res);
            console.log("Full thumbnail sent");
            // return new Promise((resolve, reject) => {
            //     const userID = user._id;
            //     dbUtilsFile.getFileInfo(fileID, userID).then((file) => {
            //         if (!file) {
            //             reject({
            //                 code: 401,
            //                 message: "File For Full Thumbnail Not Found",
            //                 exception: undefined
            //             })
            //         }
            //         const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
            //             chunkSizeBytes: 1024 * 255,
            //         })
            //         const password = user.getEncryptionKey();
            //         const IV = file.metadata.IV.buffer
            //         const readStream = bucket.openDownloadStream(new ObjectID(fileID))
            //         readStream.on("error", (e) => {
            //             reject({
            //                 code: 500,
            //                 message: "File service Full Thumbnail stream error",
            //                 exception: e
            //             })
            //         })
            //         const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        
            //         const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, IV);
            //         decipher.on("error", (e) => {
            //             reject({
            //                 code: 500,
            //                 message: "File service Full Thumbnail decipher error",
            //                 exception: e
            //             })
            //         })
            //         res.set('Content-Type', 'binary/octet-stream');
            //         res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');
            //         res.set('Content-Length', file.metadata.size);
            //         readStream.pipe(decipher).pipe(res).on("finish", () => {
            //             console.log("Sent Full Thumbnail");
            //             resolve();
            //         });
            //     });
            // })
        });
        this.getPublicDownload = (fileID, tempToken, res) => __awaiter(this, void 0, void 0, function* () {
            const file = yield dbUtilsFile.getPublicFile(fileID);
            if (!file || !file.metadata.link || file.metadata.link !== tempToken) {
                throw new NotAuthorizedError_1.default("File Not Public");
            }
            const user = yield user_1.default.findById(file.metadata.owner);
            const password = user.getEncryptionKey();
            if (!password)
                throw new NotAuthorizedError_1.default("Invalid Encryption Key");
            const bucket = new mongoose_1.default.mongo.GridFSBucket(conn.db);
            const IV = file.metadata.IV.buffer;
            const readStream = bucket.openDownloadStream(new mongodb_1.ObjectID(fileID));
            const CIPHER_KEY = crypto_1.default.createHash('sha256').update(password).digest();
            const decipher = crypto_1.default.createDecipheriv('aes256', CIPHER_KEY, IV);
            res.set('Content-Type', 'binary/octet-stream');
            res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');
            res.set('Content-Length', file.metadata.size.toString());
            yield awaitStream_1.default(readStream.pipe(decipher), res);
            if (file.metadata.linkType === "one") {
                console.log("removing public link");
                yield dbUtilsFile.removeOneTimePublicLink(fileID);
            }
        });
        this.streamVideo = (user, fileID, headers, res) => __awaiter(this, void 0, void 0, function* () {
            const userID = user._id;
            const currentFile = yield dbUtilsFile.getFileInfo(fileID, userID);
            if (!currentFile)
                throw new NotFoundError_1.default("Video File Not Found");
            const password = user.getEncryptionKey();
            if (!password)
                throw new NotAuthorizedError_1.default("Invalid Encryption Key");
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
            const bucket = new mongoose_1.default.mongo.GridFSBucket(conn.db, {
                chunkSizeBytes: 1024
            });
            const readStream = bucket.openDownloadStream(new mongodb_1.ObjectID(fileID), {
                start: start,
                end: end
            });
            const CIPHER_KEY = crypto_1.default.createHash('sha256').update(password).digest();
            const decipher = crypto_1.default.createDecipheriv('aes256', CIPHER_KEY, IV);
            res.writeHead(206, head);
            yield awaitStream_1.default(readStream.pipe(decipher), res);
            // return new Promise((resolve, reject) => {
            //     const userID = user._id;
            //     dbUtilsFile.getFileInfo(fileID, userID).then((currentFile: FileInterface) => {
            //         if (!currentFile) {
            //             reject({
            //                 code: 401, 
            //                 message: "Video Steam Not Found Error",
            //                 exception: undefined 
            //             })
            //         } else {
            //             const password = user.getEncryptionKey();
            //             if (!password) throw new NotAuthorizedError("Invalid Encryption Key")
            //             const fileSize = currentFile.metadata.size;
            //             const range = headers.range
            //             const parts = range.replace(/bytes=/, "").split("-")
            //             let start = parseInt(parts[0], 10)
            //             let end = parts[1] 
            //                 ? parseInt(parts[1], 10)
            //                 : fileSize-1
            //             const chunksize = (end-start)+1
            //             const IV = currentFile.metadata.IV.buffer
            //             let head = {
            //                 'Content-Range': 'bytes ' + start + '-' + end + '/' + fileSize,
            //                 'Accept-Ranges': 'bytes',
            //                 'Content-Length': chunksize,
            //                 'Content-Type': 'video/mp4'}
            //             const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
            //                 chunkSizeBytes: 1024
            //             });
            //             const readStream = bucket.openDownloadStream(new ObjectID(fileID), {
            //                 start: start,
            //                 end: end
            //             });
            //             readStream.on("error", (e) => {
            //                 reject({
            //                     code: 500, 
            //                     message: "File service stream video stream error",
            //                     exception: e
            //                 })
            //             })
            //             const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        
            //             const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, IV);
            //             decipher.on("error", (e) => {
            //                 reject({
            //                     code: 500, 
            //                     message: "File service stream video decipher error",
            //                     exception: e
            //                 })
            //             })
            //             res.writeHead(206, head);
            //             readStream.pipe(decipher).pipe(res).on("finish", () => {
            //                 resolve();
            //             });
            //         }
            //     })
            // })
        });
    }
}
exports.default = MongoService;
