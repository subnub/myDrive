import mongoose from "../../db/mongoose";
import { Response, Request } from "express";;
import DbUtilFile from "../../db/utils/fileUtils";
import crypto from "crypto";
import videoChecker from "../../utils/videoChecker"
import imageChecker from "../../utils/imageChecker"
import { ObjectID } from "mongodb";
import createThumbnailAny from "./utils/createThumbailAny";
import Thumbnail, {ThumbnailInterface} from "../../models/thumbnail";
import NotAuthorizedError from "../../utils/NotAuthorizedError";
import NotFoundError from "../../utils/NotFoundError";
import {GridFSBucketWriteStream} from "mongodb";
import awaitStream from "./utils/awaitStream";
import awaitUploadStream from "./utils/awaitUploadStream";
import User, { UserInterface } from "../../models/user";
import Folder, { FolderInterface } from "../../models/folder";
import { FileInterface } from "../../models/file";
import getBusboyData from "./utils/getBusboyData";
import ChunkInterface from "./utils/ChunkInterface";
import fixStartChunkLength from "./utils/fixStartChunkLength";
import getPrevIVMongo from "./utils/getPrevIVMongo";
import awaitStreamVideo from "./utils/awaitStreamVideo";
import addToStoageSize from "./utils/addToStorageSize";
import subtractFromStorageSize from "./utils/subtractFromStorageSize";
import ForbiddenError from "../../utils/ForbiddenError";

const conn = mongoose.connection;

const dbUtilsFile = new DbUtilFile();

class MongoService implements ChunkInterface {

    constructor() {

    }

    uploadFile = async(user: UserInterface, busboy: any, req: Request) => {

        const password = user.getEncryptionKey(); 

        if (!password) throw new ForbiddenError("Invalid Encryption Key")

        let bucketStream: GridFSBucketWriteStream;

        const initVect = crypto.randomBytes(16);

        const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        

        const cipher = crypto.createCipheriv('aes256', CIPHER_KEY, initVect);

        const {file, filename, formData} = await getBusboyData(busboy);

        const parent = formData.get("parent") || "/"
        const parentList = formData.get("parentList") || "/";
        const size = formData.get("size") || ""
        const personalFile = formData.get("personal-file") ? true : false;
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

        await addToStoageSize(user, size, personalFile);

        const imageCheck = imageChecker(filename);
 
        if (finishedFile.length < 15728640 && imageCheck) {

            const updatedFile = await createThumbnailAny(finishedFile, filename, user);

            return updatedFile;
           
        } else {

            return finishedFile;
        }
    }

    getFileWriteStream = async(user: UserInterface, file: FileInterface, parentFolder: FolderInterface) => {
        
        const password = user.getEncryptionKey(); 

        if (!password) throw new ForbiddenError("Invalid Encryption Key")

        const initVect = crypto.randomBytes(16);

        const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        

        const cipher = crypto.createCipheriv('aes256', CIPHER_KEY, initVect);

        const filename = file.filename
        const parent = parentFolder._id
        const parentList = [...parentFolder.parentList, parentFolder._id]
        const size = file.metadata.size
        const personalFile = file.metadata.personalFile ? true : false
        let hasThumbnail = file.metadata.hasThumbnail;
        let thumbnailID = file.metadata.thumbnailID
        const isVideo = file.metadata.isVideo;

        const metadata = {
            owner: user._id,
            parent,
            parentList,
            hasThumbnail,
            thumbnailID,
            isVideo,
            size,
            IV: file.metadata.IV
        }


        let bucket = new mongoose.mongo.GridFSBucket(conn.db);
                
        const bucketStream = bucket.openUploadStream(filename, {metadata});

        return bucketStream;
    }

    downloadFile = async(user: UserInterface, fileID: string, res: Response) => {

        const currentFile = await dbUtilsFile.getFileInfo(fileID, user._id);

        if (!currentFile) throw new NotFoundError("Download File Not Found");

        const password = user.getEncryptionKey();

        if (!password) throw new ForbiddenError("Invalid Encryption Key")

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

    getFileReadStream = async(user: UserInterface, fileID: string) => {

        const currentFile = await dbUtilsFile.getFileInfo(fileID, user._id);

        if (!currentFile) throw new NotFoundError("Download File Not Found");

        const password = user.getEncryptionKey();

        if (!password) throw new ForbiddenError("Invalid Encryption Key")

        const bucket = new mongoose.mongo.GridFSBucket(conn.db);

        const IV = currentFile.metadata.IV.buffer as Buffer;
        const readStream = bucket.openDownloadStream(new ObjectID(fileID));

        const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        

        const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, IV);

        return readStream
    }

    getThumbnail = async(user: UserInterface, id: string) => {

        const password = user.getEncryptionKey();

        if (!password) throw new ForbiddenError("Invalid Encryption Key")

        const thumbnail = await Thumbnail.findById(new ObjectID(id)) as ThumbnailInterface;
    
        if (thumbnail.owner !== user._id.toString()) {

            throw new ForbiddenError('Thumbnail Unauthorized Error');
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

        if (!password) throw new ForbiddenError("Invalid Encryption Key")

        const readStream = bucket.openDownloadStream(new ObjectID(fileID))

        const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        
    
        const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, IV);

        res.set('Content-Type', 'binary/octet-stream');
        res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');
        res.set('Content-Length', file.metadata.size.toString());

        const allStreamsToErrorCatch = [readStream, decipher];

        await awaitStream(readStream.pipe(decipher), res, allStreamsToErrorCatch);
    }

    getPublicDownload = async(fileID: string, tempToken: any, res: Response) => {

        const file = await dbUtilsFile.getPublicFile(fileID);

        if (!file || !file.metadata.link || file.metadata.link !== tempToken) {
            throw new NotAuthorizedError("File Not Public");
        }

        const user = await User.findById(file.metadata.owner) as UserInterface;

        const password = user.getEncryptionKey();

        if (!password) throw new ForbiddenError("Invalid Encryption Key");

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
            await dbUtilsFile.removeOneTimePublicLink(fileID);
        }
    }

    streamVideo = async(user: UserInterface, fileID: string, headers: any, res: Response, req: Request) => {
        
        // THIS ISN'T WORKING FULLY WHEN USING MONGODB AND SAFARI, 
        // OTHER DATABASES SHOULD WORK, BUT I AM NOT SURE WHY
        // IT WILL NOT WORK ON SAFARI SOMETIMES

        // To get this all working correctly with encryption and across
        // All browsers took many days, tears, and some of my sanity. 
        // Shoutout to Tyzoid for helping me with the decryption
        // And and helping me understand how the IVs work.
        
        // P.S I hate safari >:(
        // Why do yall have to be weird with video streaming
        // 90% of the issues with this are only in Safari
        // Is safari going to be the next internet explorer?

        const userID = user._id;
        const currentFile = await dbUtilsFile.getFileInfo(fileID, userID);

        if (!currentFile) throw new NotFoundError("Video File Not Found");

        const password = user.getEncryptionKey();

        if (!password) throw new ForbiddenError("Invalid Encryption Key")

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

        let fixedStart = 0;
        let fixedEnd = currentFile.length;

        if (start === 0 && end === 1) {
            
            // This is for Safari/iOS, Safari will request the first
            // Byte before actually playing the video. Needs to be 
            // 16 bytes.

            fixedStart = 0;
            fixedEnd = 16;    

            // I am not sure why this needs to be 16 for mongoDB, on the other routes 15 works
            // Fine, and I thought the start and end were inclusive, but I am really not sure
            // At this point

        } else {

            // If you're a normal browser, or this isn't Safari's first request
            // We need to make it so start is divisible by 16, since AES256
            // Has a block size of 16 bytes.

            fixedStart = start % 16 === 0 ? start : fixStartChunkLength(start);
        }

        if (+start === 0) {
    
            // This math will not work if the start is 0
            // So if it is we just change fixed start back
            // To 0.

            fixedStart = 0;
        }

        // We also need to calculate the difference between the start and the 
        // Fixed start position. Since there will be an offset if the original
        // Request is not divisible by 16, it will not return the right part
        // Of the file, you will see how we do this in the awaitStreamVideo
        // code.
    
        const differenceStart = start - fixedStart;


        if (fixedStart !== 0 && start !== 0) {

            // If this isn't the first request, the way AES256 works is when you try to
            // Decrypt a certain part of the file that isn't the start, the IV will 
            // Actually be the 16 bytes ahead of where you are trying to 
            // Start the decryption.
    
            currentIV = await getPrevIVMongo(fixedStart - 16, fileID) as Buffer;
        }
        
        const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
        });
        
        const readStream = bucket.openDownloadStream(new ObjectID(fileID), {
            start: fixedStart,
            end: fixedEnd,
        });

        const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()

        res.writeHead(206, head);

        const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, currentIV);
        decipher.setAutoPadding(false);

        const allStreamsToErrorCatch = [readStream, decipher];

        readStream.pipe(decipher);

        await awaitStreamVideo(start, end, differenceStart, decipher, res, req, allStreamsToErrorCatch, readStream);

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
        await subtractFromStorageSize(userID, file.length, file.metadata.personalFile!);
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