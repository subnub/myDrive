import mongoose from "../../db/mongoose";
import {Response, Request} from "express";
const conn = mongoose.connection;
const env = require("../../enviroment/env");
const DbUtilFolder = require("../../db/utils/folderUtils");
import DbUtilFile from "../../db/utils/fileUtils/index";
import crypto from "crypto";
const videoChecker = require("../../utils/videoChecker");
const imageChecker = require("../../utils/imageChecker");
const ObjectID = require('mongodb').ObjectID
import createThumbnail from "../FileService/utils/createThumbnail";
import Thumbnail, {ThumbnailInterface} from "../../models/thumbnail";
import NotAuthorizedError from "../../utils/NotAuthorizedError";

import User, { UserInterface } from "../../models/user";
import { FileInterface } from "../../models/file";
const removeChunks = require("../FileService/utils/removeChunks");

const dbUtilsFile = new DbUtilFile();
const dbUtilsFolder = new DbUtilFolder();

class MongoService {

    constructor() {

    }

    uploadFile = (user: UserInterface, busboy: any, req: Request) => {

        return new Promise((resolve, reject) => {

            const password = user.getEncryptionKey(); 

            let bucketStream: any;

            const initVect = crypto.randomBytes(16);

            const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        

            const cipher = crypto.createCipheriv('aes256', CIPHER_KEY, initVect);

            cipher.on("error", async(e) => {
                await removeChunks(bucketStream);
                reject({
                    message: "File service upload cipher error",
                    exception: e,
                    code: 500
                })
            })

            const formData = new Map();

            busboy.on("error", async(e: Error) => {
                await removeChunks(bucketStream);
                reject({
                    message: "File service upload busboy error",
                    exception: e,
                    code: 500
                })
            })

            busboy.on("file", async(_: string, file: any, filename: string) => {

                const parent = formData.get("parent") || "/"
                const parentList = formData.get("parentList") || "/";
                const size = formData.get("size") || ""
                let hasThumbnail = false;
                let thumbnailID = ""
                const isVideo = videoChecker(filename)
            
                const metadata = {
                                    owner: user._id,
                                    parent,
                                    parentList,
                                    hasThumbnail,
                                    thumbnailID,
                                    isVideo,
                                    size,
                                    IV: initVect
                                }


                let bucket = new mongoose.mongo.GridFSBucket(conn.db, {
                                    chunkSizeBytes: 1024 * 255
                                });
                

                bucketStream = bucket.openUploadStream(filename, {metadata})

                bucketStream.on("error", async(e: Error) => {
                    await removeChunks(bucketStream);
                    reject({
                        message: "Cannot upload file to database",
                        exception: e,
                        code: 500
                    })
                })

                req.on("aborted", async() => {

                    console.log("Upload Request Cancelling...");

                    await removeChunks(bucketStream);
                })

                file.pipe(cipher).pipe(bucketStream);

                bucketStream.on("finish", (file: FileInterface) => {
                
                    const imageCheck = imageChecker(filename);

                    if (file.length < 15728640 && imageCheck) {

                        createThumbnail(file, filename, user).then((updatedFile: FileInterface) => {
                            resolve(updatedFile);
                        })

                    } else {

                        resolve(file);
                    }

                })

            }).on("field", (field: any, val: any) => {

                formData.set(field, val)

            })

        })
    }

    downloadFile = (user: UserInterface, fileID: string, res: Response) => {

        return new Promise((resolve, reject) => {

            dbUtilsFile.getFileInfo(fileID, user._id).then((currentFile: FileInterface) => {

                if (!currentFile) {

                    reject({
                        code: 401, 
                        message: "Download File Not Found Error",
                        exception: undefined
                    })

                } else {

                    const password: Buffer = user.getEncryptionKey();

                    const bucket = new mongoose.mongo.GridFSBucket(conn.db);

                    const IV = currentFile.metadata.IV.buffer
                    const readStream = bucket.openDownloadStream(ObjectID(fileID));

                    readStream.on("error", (e: Error) => {
                        reject({
                            code: 500, 
                            message: "File service download decipher error",
                            exception: e
                        })
                    })

                    const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        

                    const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, IV);

                    decipher.on("error", (e) => {
                        reject({
                            code: 500, 
                            message: "File service download decipher error",
                            exception: e
                        })
                    })

                    res.set('Content-Type', 'binary/octet-stream');
                    res.set('Content-Disposition', 'attachment; filename="' + currentFile.filename + '"');
                    res.set('Content-Length', currentFile.metadata.size.toString()); 

                    readStream.pipe(decipher).pipe(res).on("finish", () => {
                        resolve();
                    });
                }

            })
        })
    }

    getThumbnail = async(user: UserInterface, id: string) => {

        const password: Buffer = user.getEncryptionKey();

        const thumbnail = await Thumbnail.findById(id) as ThumbnailInterface;
    
        if (thumbnail.owner !== user._id.toString()) {

            throw new NotAuthorizedError('Thumbnail Unauthorized Error');
        }

        const iv =  thumbnail.data.slice(0, 16);
        
        const chunk = thumbnail.data.slice(16);
        
        const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        
        
        const decipher = crypto.createDecipheriv("aes256", CIPHER_KEY, iv);
        
        const decryptedThumbnail = Buffer.concat([decipher.update(chunk), decipher.final()]);    

        return decryptedThumbnail; 
    }

    getFullThumbnail = (user: UserInterface, fileID: string, res: Response) => {

        return new Promise((resolve, reject) => {

            const userID = user._id;

            dbUtilsFile.getFileInfo(fileID, userID).then((file) => {

                if (!file) {
                    reject({
                        code: 401,
                        message: "File For Full Thumbnail Not Found",
                        exception: undefined
                    })
                }
    
                const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
                    chunkSizeBytes: 1024 * 255,
                })
                const password = user.getEncryptionKey();
                const IV = file.metadata.IV.buffer
    
                const readStream = bucket.openDownloadStream(ObjectID(fileID))
                
                readStream.on("error", (e) => {
                    reject({
                        code: 500,
                        message: "File service Full Thumbnail stream error",
                        exception: e
                    })
                })
    
                const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        
            
                const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, IV);
            
                decipher.on("error", (e) => {
                    reject({
                        code: 500,
                        message: "File service Full Thumbnail decipher error",
                        exception: e
                    })
                })

                res.set('Content-Type', 'binary/octet-stream');
                res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');
                res.set('Content-Length', file.metadata.size);
    
                readStream.pipe(decipher).pipe(res).on("finish", async() => {
                    console.log("Sent Full Thumbnail");
                    resolve();
                });
            });
        })

    }

    getPublicDownload = (fileID: string, tempToken: any, res: Response) => {

        return new Promise((resolve, reject) => {

            dbUtilsFile.getPublicFile(fileID).then(async(file: FileInterface) => {

                if (!file || !file.metadata.link || file.metadata.link !== tempToken) {
                    reject({
                        code: 401,
                        message: "File not public/Not found",
                        exception: undefined
                    })
                } else {

                    const user = await User.findById(file.metadata.owner) as UserInterface;

                    const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
                        chunkSizeBytes: 1024 * 255,
                    })
        
                    const password = user.getEncryptionKey();
                    const IV = file.metadata.IV.buffer
                   
                    const readStream = bucket.openDownloadStream(ObjectID(fileID))
        
                    readStream.on("error", (e) => {
                        reject({
                            code: 500,
                            message: "File service public download decipher error",
                            exception: e
                        })
                    })
        
                    const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        
        
                    const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, IV);
        
                    decipher.on("error", (e) => {
                        reject({
                            code: 500,
                            message: "File service public download decipher error",
                            exception: e
                        })
                    })
    
                    res.set('Content-Type', 'binary/octet-stream');
                    res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');
                    res.set('Content-Length', file.metadata.size.toString());
        
                    readStream.pipe(decipher).pipe(res).on("finish", async() => {
                        
                        if (file.metadata.linkType === "one") {
                            console.log("removing public link");
                            await dbUtilsFile.removeOneTimePublicLink(fileID);
                        }
                        resolve();
                    });
                    
                }

            })
        })
    }

}

export default MongoService;