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
const mongoose = require("../../../db/mongoose");
const conn = mongoose.connection;
const crypto = require("crypto");
const env = require("../../../enviroment/env");
const thumbnail_1 = __importDefault(require("../../../models/thumbnail"));
const ObjectID = require('mongodb').ObjectID;
const sharp = require("sharp");
const concat = require("concat-stream");
const fs_1 = __importDefault(require("fs"));
const uuid_1 = __importDefault(require("uuid"));
const createThumbnailFS = (file, filename, user) => {
    return new Promise((resolve) => {
        const password = user.getEncryptionKey();
        let CIPHER_KEY = crypto.createHash('sha256').update(password).digest();
        const thumbnailFilename = uuid_1.default.v4();
        const readStream = fs_1.default.createReadStream(file.metadata.filePath);
        const writeStream = fs_1.default.createWriteStream(`/Users/kylehoell/Documents/fstestdata/${thumbnailFilename}`);
        const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, file.metadata.IV);
        readStream.on("error", (e) => {
            console.log("File service upload thumbnail error", e);
            resolve(file);
        });
        writeStream.on("error", (e) => {
            console.log("File service upload write thumbnail error", e);
            resolve(file);
        });
        decipher.on("error", (e) => {
            console.log("File service upload thumbnail decipher error", e);
            resolve(file);
        });
        try {
            const thumbnailIV = crypto.randomBytes(16);
            const thumbnailCipher = crypto.createCipheriv("aes256", CIPHER_KEY, thumbnailIV);
            const imageResize = sharp().resize(300).on("error", (e) => {
                console.log("resize error", e);
                resolve(file);
            });
            readStream.pipe(decipher).pipe(imageResize).pipe(thumbnailCipher).pipe(writeStream);
            writeStream.on("finish", () => __awaiter(void 0, void 0, void 0, function* () {
                console.log("Thumbnail written");
                const thumbnailModel = new thumbnail_1.default({ name: filename, owner: user._id, IV: thumbnailIV, path: `/Users/kylehoell/Documents/fstestdata/${thumbnailFilename}` });
                yield thumbnailModel.save();
                let updatedFile = yield conn.db.collection("fs.files")
                    .findOneAndUpdate({ "_id": file._id }, { "$set": { "metadata.hasThumbnail": true, "metadata.thumbnailID": thumbnailModel._id } });
                updatedFile = updatedFile.value;
                updatedFile = Object.assign(Object.assign({}, updatedFile), { metadata: Object.assign(Object.assign({}, updatedFile.metadata), { hasThumbnail: true, thumbnailID: thumbnailModel._id }) });
                resolve(updatedFile);
            }));
        }
        catch (e) {
            console.log("Thumbnail error", e);
            resolve(file);
        }
        // try {
        //     const concatStream = concat(async(bufferData: Buffer) => {
        //             const thumbnailIV = crypto.randomBytes(16); 
        //             const thumbnailCipher = crypto.createCipheriv("aes256", CIPHER_KEY, thumbnailIV);
        //             bufferData = Buffer.concat([thumbnailIV, thumbnailCipher.update(bufferData), thumbnailCipher.final()]);
        //             const thumbnailModel = new Thumbnail({name: filename, owner: user._id, data: bufferData});
        //             await thumbnailModel.save();
        //             let updatedFile = await conn.db.collection("fs.files")
        //                 .findOneAndUpdate({"_id": file._id}, {"$set": {"metadata.hasThumbnail": true, "metadata.thumbnailID": thumbnailModel._id}})
        //             updatedFile = updatedFile.value;
        //             updatedFile = {...updatedFile, metadata: {...updatedFile.metadata, hasThumbnail: true, thumbnailID: thumbnailModel._id}}
        //             resolve(updatedFile);
        //             }).on("error", (e: Error) => {
        //                 console.log("File service upload concat stream error", e);
        //                 resolve(file);
        //             })
        //             const imageResize = sharp().resize(300).on("error", (e: Error) => {
        //                 console.log("resize error", e);
        //                 resolve(file);
        //             })
        //     readStream.pipe(decipher).pipe(imageResize).pipe(concatStream);
        // } catch (e) {
        //     console.log(e);
        //     resolve(file);
        // }
    });
};
exports.default = createThumbnailFS;
