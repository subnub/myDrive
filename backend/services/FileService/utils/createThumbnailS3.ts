import mongoose from "../../../db/mongoose";
const conn = mongoose.connection;
const crypto= require("crypto");
import Thumbnail from "../../../models/thumbnail"; 
const ObjectID = require('mongodb').ObjectID
const sharp = require("sharp");
const concat = require("concat-stream")
import {FileInterface} from "../../../models/file";
import {UserInterface} from "../../../models/user";
import fs from "fs";
import uuid from "uuid";
import env from "../../../enviroment/env";
import s3 from "../../../db/s3";
import awaitUploadStreamS3 from "../../ChunkService/utils/awaitUploadStreamS3";

const createThumbnailS3 = (file: FileInterface, filename: string, user: UserInterface) => {

    return new Promise<FileInterface>((resolve, reject) => {

        const password = user.getEncryptionKey();

        let CIPHER_KEY = crypto.createHash('sha256').update(password).digest()       
        
        const thumbnailFilename = uuid.v4();
    
        const params: any = {Bucket: env.s3Bucket, Key: file.metadata.s3ID!};

        const readStream = s3.getObject(params).createReadStream();

        //const readStream = fs.createReadStream(file.metadata.filePath!);
        //const writeStream = fs.createWriteStream(env.fsDirectory + thumbnailFilename);


        const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, file.metadata.IV);

       


        readStream.on("error", (e: Error) => {
            console.log("File service upload thumbnail error", e);
            resolve(file);
        })

        // writeStream.on("error", (e: Error) => {
        //     console.log("File service upload write thumbnail error", e);
        //     resolve(file);
        // })
    
        decipher.on("error", (e: Error) => {
            console.log("File service upload thumbnail decipher error", e);
            resolve(file)
         })

        try {
            
            
            const thumbnailIV = crypto.randomBytes(16); 
    
            const thumbnailCipher = crypto.createCipheriv("aes256", CIPHER_KEY, thumbnailIV);

            const imageResize = sharp().resize(300).on("error", (e: Error) => {
                
                console.log("resize error", e);
                resolve(file);
                
            })

            const paramsWrite: any = {
                Bucket: env.s3Bucket,
                Body : readStream.pipe(decipher).pipe(imageResize).pipe(thumbnailCipher),
                Key : thumbnailFilename
            };

            //readStream.pipe(decipher).pipe(imageResize).pipe(thumbnailCipher).pipe(writeStream);
            //await awaitUploadStreamS3(paramsWrite);

            s3.upload(paramsWrite, async(err: any, data: any) => {

                if (err) {
                    console.log("Amazon Upload Error", err);
                    reject("Amazon upload error");
                }
    
                console.log("Thumbnail written");

                const thumbnailModel = new Thumbnail({name: thumbnailFilename, owner: user._id, IV: thumbnailIV, s3ID: thumbnailFilename});

                await thumbnailModel.save();

                const getUpdatedFile = await conn.db.collection("fs.files")
                        .findOneAndUpdate({"_id": file._id}, {"$set": {"metadata.hasThumbnail": true, "metadata.thumbnailID": thumbnailModel._id}})
    
                let updatedFile: FileInterface = getUpdatedFile.value;
    
                updatedFile = {...updatedFile, metadata: {...updatedFile.metadata, hasThumbnail: true, thumbnailID: thumbnailModel._id}} as FileInterface;
    
                resolve(updatedFile);
            })

            // writeStream.on("finish", async() => {
            //     console.log("Thumbnail written");

            //     const thumbnailModel = new Thumbnail({name: filename, owner: user._id, IV: thumbnailIV, path: env.fsDirectory + thumbnailFilename});

            //     await thumbnailModel.save();

            //     let updatedFile = await conn.db.collection("fs.files")
            //             .findOneAndUpdate({"_id": file._id}, {"$set": {"metadata.hasThumbnail": true, "metadata.thumbnailID": thumbnailModel._id}})
    
            //     updatedFile = updatedFile.value;
    
            //     updatedFile = {...updatedFile, metadata: {...updatedFile.metadata, hasThumbnail: true, thumbnailID: thumbnailModel._id}}
    
            //     resolve(updatedFile);
            // })

         } catch (e) {

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
    
    })
}

export default createThumbnailS3;