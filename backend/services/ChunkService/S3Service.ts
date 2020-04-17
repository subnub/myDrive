import File, { FileInterface } from "../../models/file";
import User, {UserInterface} from "../../models/user";
import s3 from "../../db/s3";
import env from "../../enviroment/env";

import { Response, Request } from "express";
import ChunkInterface from "./utils/ChunkInterface";
import NotAuthorizedError from "../../utils/NotAuthorizedError";
import NotFoundError from "../../utils/NotFoundError";
import crypto from "crypto";
import getBusboyData from "./utils/getBusboyData";
import videoChecker from "../../utils/videoChecker";
import fs from "fs";
import uuid from "uuid";
import awaitUploadStreamS3 from "./utils/awaitUploadStreamS3";
import getFileSize from "./utils/getFileSize";
import awaitStream from "./utils/awaitStream";
import createThumbnailFS from "../FileService/utils/createThumbnailFS";
import imageChecker from "../../utils/imageChecker";
import Thumbnail, {ThumbnailInterface} from "../../models/thumbnail";
import streamToBuffer from "../../utils/streamToBuffer";
import { removeChunksFS } from "./utils/awaitUploadStreamFS";

import DbUtilFile from "../../db/utils/fileUtils/index";
const dbUtilsFile = new DbUtilFile();


class S3Service {

    constructor() {

    }

    uploadFile = async(user: UserInterface, busboy: any, req: Request) => {

        const password = user.getEncryptionKey(); 

        if (!password) throw new NotAuthorizedError("Invalid Encryption Key")

        const initVect = crypto.randomBytes(16);

        const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        

        const cipher = crypto.createCipheriv('aes256', CIPHER_KEY, initVect);

        const {file, filename, formData} = await getBusboyData(busboy);

        const parent = formData.get("parent") || "/"
        const parentList = formData.get("parentList") || "/";
        const size = formData.get("size") || ""
        let hasThumbnail = false;
        let thumbnailID = ""
        const isVideo = videoChecker(filename)

        const randomS3ID = uuid.v4();
            
        const metadata = {
                owner: user._id,
                parent,
                parentList,
                hasThumbnail,
                thumbnailID,
                isVideo,
                size,
                IV: initVect,
                s3ID: randomS3ID
        }

        const params = {
            Bucket: env.s3Bucket,
            Body : file.pipe(cipher),
            Key : randomS3ID
        };

        await awaitUploadStreamS3(params);

        const date = new Date();
        const encryptedFileSize = size; //await getFileSize(metadata.filePath);
        
        const currentFile = new File({
            filename,
            uploadDate: date.toISOString(),
            length: encryptedFileSize,
            metadata
        });

        await currentFile.save();

        console.log("Sending file...")

        return currentFile;
 
        // if (finishedFile.length < 15728640 && imageCheck) {

        //     // const updatedFile = await createThumbnail(finishedFile, filename, user);

        //     // return updatedFile;
           
        // } else {

        //     return finishedFile;
        // }
    } 

    downloadFile = async(user: UserInterface, fileID: string, res: Response) => { 

        const currentFile: FileInterface = await dbUtilsFile.getFileInfo(fileID, user._id);

        if (!currentFile) throw new NotFoundError("Download File Not Found");

        const password = user.getEncryptionKey();

        if (!password) throw new NotAuthorizedError("Invalid Encryption Key")

        const IV = currentFile.metadata.IV.buffer

        const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        

        const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, IV);

        res.set('Content-Type', 'binary/octet-stream');
        res.set('Content-Disposition', 'attachment; filename="' + currentFile.filename + '"');
        res.set('Content-Length', currentFile.metadata.size.toString()); 

        const params: any = {Bucket: env.s3Bucket, Key: currentFile.metadata.s3ID!};

        const s3ReadStream = s3.getObject(params).createReadStream();

        await awaitStream(s3ReadStream.pipe(decipher), res);

    }

    streamVideo = async(user: UserInterface, fileID: string, headers: any, res: Response) => { 

        const userID = user._id;
        const currentFile: FileInterface = await dbUtilsFile.getFileInfo(fileID, userID);

        if (!currentFile) throw new NotFoundError("Video File Not Found");

        const password = user.getEncryptionKey();

        if (!password) throw new NotAuthorizedError("Invalid Encryption Key")

        const fileSize = currentFile.metadata.size;
                    
        const range = headers.range
        const parts = range.replace(/bytes=/, "").split("-")
        let start = parseInt(parts[0], 10)
        let end = parts[1] 
            ? parseInt(parts[1], 10)
            : fileSize-1
        const chunksize = (end-start)+1
        const IV = currentFile.metadata.IV.buffer
                
        let head = {
            'Content-Range': 'bytes ' + start + '-' + end + '/' + fileSize,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4'}

        const params: any = {Bucket: env.s3Bucket, Key: currentFile.metadata.s3ID!, Range: `bytes=${start}-${end}`};

        const s3ReadStream = s3.getObject(params).createReadStream();

        const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        

        const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, IV);

        res.writeHead(206, head);

        await awaitStream(s3ReadStream.pipe(decipher), res);
        
    }
}

export default S3Service;