import mongoose from "../../db/mongoose";
import { Response, Request } from "express";
import DbUtilFolder from "../../db/utils/folderUtils";
import DbUtilFile from "../../db/utils/fileUtils";
import crypto from "crypto";
import videoChecker from "../../utils/videoChecker"
import imageChecker from "../../utils/imageChecker"
import { ObjectID } from "mongodb";
import createThumbnail from "./utils/createThumbnail";
import Thumbnail, {ThumbnailInterface} from "../../models/thumbnail";
import NotAuthorizedError from "../../utils/NotAuthorizedError";
import NotFoundError from "../../utils/NotFoundError";
import {GridFSBucketWriteStream} from "mongodb";
import awaitStream from "./utils/awaitStream";
import awaitUploadStream from "./utils/awaitUploadStream";
import User, { UserInterface } from "../../models/user";
import Folder from "../../models/folder";
import { FileInterface } from "../../models/file";
import getBusboyData from "./utils/getBusboyData";
import ChunkInterface from "./utils/ChunkInterface";
import fixStartChunkLength from "./utils/fixStartChunkLength";
import getPrevIVMongo from "./utils/getPrevIVMongo";
import awaitStreamVideo from "./utils/awaitStreamVideo";

const conn = mongoose.connection;

const dbUtilsFile = new DbUtilFile();

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

        const IV = currentFile.metadata.IV.buffer as Buffer;
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
        const IV = file.metadata.IV.buffer as Buffer;

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

        const IV = file.metadata.IV.buffer as Buffer;
                   
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

    streamVideo = async(user: UserInterface, fileID: string, headers: any, res: Response, req: Request) => {
        
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
        const IV = currentFile.metadata.IV.buffer as Buffer;
                
        let head = {
            'Content-Range': 'bytes ' + start + '-' + end + '/' + fileSize,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4'}

        let currentIV = IV;

        let fixedStart = start % 16 === 0 ? start : fixStartChunkLength(start);

        if (+start === 0) {
    
            fixedStart = 0;
        }

        const fixedEnd = currentFile.length;
    
        const differenceStart = start - fixedStart;

        if (fixedStart !== 0 && start !== 0) {
    
            currentIV = await getPrevIVMongo(fixedStart - 16, fileID) as Buffer;
        }
        
        const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
            chunkSizeBytes: 1024
        });
        
        const readStream = bucket.openDownloadStream(new ObjectID(fileID), {
            start: fixedStart,
            end: fixedEnd,
        });

        const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        

        const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, currentIV);
        decipher.setAutoPadding(false);

        res.writeHead(206, head);

        const allStreamsToErrorCatch = [readStream, decipher];

        readStream.pipe(decipher);

        // req.on("close", () => {
        //     // console.log("req closed");
        //     readStream.destroy();
        // })


        const tempUUID = req.params.uuid;

        await awaitStreamVideo(start, end, differenceStart, decipher, res, req, tempUUID, allStreamsToErrorCatch);
        readStream.destroy();
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
    
        await bucket.delete(new ObjectID(fileID));
    }

    deleteFolder = async(userID: string, folderID: string, parentList: string[]) => {
        
        let bucket = new mongoose.mongo.GridFSBucket(conn.db, {
            chunkSizeBytes: 1024 * 255
        });

        const parentListString = parentList.toString()
    
        await Folder.deleteMany({"owner": userID, "parentList": { $all: parentList}})
        await Folder.deleteMany({"owner": userID, "_id": folderID});

        const fileList = await dbUtilsFile.getFileListByParent(userID, parentListString);
    
        if (!fileList) throw new NotFoundError("Delete File List Not Found");
        
        for (let i = 0; i < fileList.length; i++) {

            const currentFile = fileList[i];

            try {
                
                if (currentFile.metadata.thumbnailID) {
                    
                    await Thumbnail.deleteOne({_id: currentFile.metadata.thumbnailID});
                }
                    
                await bucket.delete(new ObjectID(currentFile._id));   

            } catch (e) {

                console.log("Could not delete file", currentFile.filename, currentFile._id);
            }
           
        } 
    }

    deleteAll = async(userID: string) => {

        console.log("remove all request")

        let bucket = new mongoose.mongo.GridFSBucket(conn.db, {
            chunkSizeBytes: 1024 * 255
        });

        await Folder.deleteMany({"owner": userID});

        const fileList = await dbUtilsFile.getFileListByOwner(userID);

        if (!fileList) throw new NotFoundError("Delete All File List Not Found Error");

        for (let i = 0; i < fileList.length; i++) {
            const currentFile = fileList[i];

            try {

                if (currentFile.metadata.thumbnailID) {

                    await Thumbnail.deleteOne({_id: currentFile.metadata.thumbnailID})
                }
    
                await bucket.delete(new ObjectID(currentFile._id));

            } catch (e) {

                console.log("Could Not Remove File", currentFile.filename, currentFile._id);
            }
        }
    }
}

export default MongoService;