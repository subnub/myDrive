import mongoose from "../../db/mongoose";
import {Response} from "express";
const conn = mongoose.connection;
const env = require("../../enviroment/env");
const DbUtilFolder = require("../../db/utils/folderUtils");
import DbUtilFile from "../../db/utils/fileUtils/index";
import crypto from "crypto";

const ObjectID = require('mongodb').ObjectID

import { UserInterface } from "../../models/user";
import { FileInterface } from "../../models/file";

const dbUtilsFile = new DbUtilFile();
const dbUtilsFolder = new DbUtilFolder();

class MongoService {

    constructor() {

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

}

export default MongoService;