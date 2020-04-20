import mongoose from "../../db/mongoose";
import { Response, Request } from "express";
const conn = mongoose.connection;
const DbUtilFolder = require("../../db/utils/folderUtils");
import DbUtilFile from "../../db/utils/fileUtils";
import crypto from "crypto";
import videoChecker from "../../utils/videoChecker"
import imageChecker from "../../utils/imageChecker"
import { ObjectID } from "mongodb";
import createThumbnail from "../FileService/utils/createThumbnail";
import Thumbnail, {ThumbnailInterface} from "../../models/thumbnail";
import NotAuthorizedError from "../../utils/NotAuthorizedError";
import InternalServerError from "../../utils/InternalServerError";
import NotFoundError from "../../utils/NotFoundError";
import {GridFSBucketWriteStream} from "mongodb";
import awaitStream from "./utils/awaitStream";
import awaitUploadStream from "./utils/awaitUploadStream";

import User, { UserInterface } from "../../models/user";
import { FileInterface } from "../../models/file";
import { Stream } from "stream";
import removeChunks from "../FileService/utils/removeChunks";
import getBusboyData from "./utils/getBusboyData";

import ChunkInterface from "./utils/ChunkInterface";
const dbUtilsFile = new DbUtilFile();
const dbUtilsFolder = new DbUtilFolder();

class MongoService implements ChunkInterface {

    constructor() {

    }

    uploadFile = async(user: UserInterface, busboy: any, req: Request) => {

        const password = user.getEncryptionKey(); 

        if (!password) throw new NotAuthorizedError("Invalid Encryption Key")

        let bucketStream: GridFSBucketWriteStream;

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


        let bucket = new mongoose.mongo.GridFSBucket(conn.db);
                
        bucketStream = bucket.openUploadStream(filename, {metadata});

        const allStreamsToErrorCatch = [file, cipher, bucketStream];

        const finishedFile = await awaitUploadStream(file.pipe(cipher), bucketStream, req, allStreamsToErrorCatch) as FileInterface;

        const imageCheck = imageChecker(filename);
 
        if (finishedFile.length < 15728640 && imageCheck) {

            const updatedFile = await createThumbnail(finishedFile, filename, user);

            return updatedFile;
           
        } else {

            return finishedFile;
        }
    }

    downloadFile = async(user: UserInterface, fileID: string, res: Response) => {

        const currentFile = await dbUtilsFile.getFileInfo(fileID, user._id);

        if (!currentFile) throw new NotFoundError("Download File Not Found");

        const password = user.getEncryptionKey();

        if (!password) throw new NotAuthorizedError("Invalid Encryption Key")

        const bucket = new mongoose.mongo.GridFSBucket(conn.db);

        const IV = currentFile.metadata.IV.buffer
        const readStream = bucket.openDownloadStream(new ObjectID(fileID));

        const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        

        const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, IV);

        res.set('Content-Type', 'binary/octet-stream');
        res.set('Content-Disposition', 'attachment; filename="' + currentFile.filename + '"');
        res.set('Content-Length', currentFile.metadata.size.toString()); 

        const allStreamsToErrorCatch = [readStream, decipher];

        await awaitStream(readStream.pipe(decipher), res, allStreamsToErrorCatch);
    }

    getThumbnail = async(user: UserInterface, id: string) => {

        const password = user.getEncryptionKey();

        if (!password) throw new NotAuthorizedError("Invalid Encryption Key")

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

    getFullThumbnail = async(user: UserInterface, fileID: string, res: Response) => {

        const userID = user._id;

        const file = await dbUtilsFile.getFileInfo(fileID, userID);

        if (!file) throw new NotFoundError("File Thumbnail Not Found");

        const bucket = new mongoose.mongo.GridFSBucket(conn.db);
        const password = user.getEncryptionKey();
        const IV = file.metadata.IV.buffer

        if (!password) throw new NotAuthorizedError("Invalid Encryption Key")

        const readStream = bucket.openDownloadStream(new ObjectID(fileID))

        const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        
    
        const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, IV);

        res.set('Content-Type', 'binary/octet-stream');
        res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');
        res.set('Content-Length', file.metadata.size.toString());

        console.log("Sending Full Thumbnail...")

        const allStreamsToErrorCatch = [readStream, decipher];

        await awaitStream(readStream.pipe(decipher), res, allStreamsToErrorCatch);
        console.log("Full thumbnail sent");
    }

    getPublicDownload = async(fileID: string, tempToken: any, res: Response) => {

        const file = await dbUtilsFile.getPublicFile(fileID);

        if (!file || !file.metadata.link || file.metadata.link !== tempToken) {
            throw new NotAuthorizedError("File Not Public");
        }

        const user = await User.findById(file.metadata.owner) as UserInterface;

        const password = user.getEncryptionKey();

        if (!password) throw new NotAuthorizedError("Invalid Encryption Key");

        const bucket = new mongoose.mongo.GridFSBucket(conn.db);

        const IV = file.metadata.IV.buffer
                   
        const readStream = bucket.openDownloadStream(new ObjectID(fileID))
        
        const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        

        const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, IV);
    
        res.set('Content-Type', 'binary/octet-stream');
        res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');
        res.set('Content-Length', file.metadata.size.toString());

        const allStreamsToErrorCatch = [readStream, decipher];

        await awaitStream(readStream.pipe(decipher), res, allStreamsToErrorCatch);

        if (file.metadata.linkType === "one") {
            console.log("removing public link");
            await dbUtilsFile.removeOneTimePublicLink(fileID);
        }
    }

    streamVideo = async(user: UserInterface, fileID: string, headers: any, res: Response) => {
        
        const userID = user._id;
        const currentFile = await dbUtilsFile.getFileInfo(fileID, userID);

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

        const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
            chunkSizeBytes: 1024
        });
        
        const readStream = bucket.openDownloadStream(new ObjectID(fileID), {
            start: start,
            end: end
        });

        const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        

        const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, IV);

        res.writeHead(206, head);

        const allStreamsToErrorCatch = [readStream, decipher];

        await awaitStream(readStream.pipe(decipher), res, allStreamsToErrorCatch);
    }

    deleteFile = async(userID: string, fileID: string) => {

        let bucket = new mongoose.mongo.GridFSBucket(conn.db, {
            chunkSizeBytes: 1024 * 255,
        });
           
        const file = await dbUtilsFile.getFileInfo(fileID, userID);
    
        if (!file) throw new NotFoundError("Delete File Not Found Error");
    
        if (file.metadata.thumbnailID) {
    
            await Thumbnail.deleteOne({_id: file.metadata.thumbnailID});
        }
    
        // if (file.metadata.isVideo && file.metadata.transcoded) {
        //     try {
        //         await bucket.delete(new ObjectID(file.metadata.transcodedID));
        //     } catch (e) {
        //         console.log("Could Not Find Transcoded Video");
        //     }
        // }
    
        await bucket.delete(new ObjectID(fileID));
    }
}

export default MongoService;