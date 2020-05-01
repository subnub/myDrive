import mongoose from "../../../db/mongoose";
import crypto from "crypto";
import Thumbnail from "../../../models/thumbnail"; 
import sharp from "sharp";
import {FileInterface} from "../../../models/file";
import {UserInterface} from "../../../models/user";
import fs from "fs";
import uuid from "uuid";
import env from "../../../enviroment/env";

const conn = mongoose.connection;

const createThumbnailFS = (file: FileInterface, filename: string, user: UserInterface) => {

    return new Promise<FileInterface>((resolve) => {

        const password = user.getEncryptionKey();

        let CIPHER_KEY = crypto.createHash('sha256').update(password!).digest()       
        
        const thumbnailFilename = uuid.v4();
    
        const readStream = fs.createReadStream(file.metadata.filePath!);
        const writeStream = fs.createWriteStream(env.fsDirectory + thumbnailFilename);
        const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, file.metadata.IV);

        readStream.on("error", (e: Error) => {
            console.log("File service upload thumbnail error", e);
            resolve(file);
        })

        writeStream.on("error", (e: Error) => {
            console.log("File service upload write thumbnail error", e);
            resolve(file);
        })
    
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

            readStream.pipe(decipher).pipe(imageResize).pipe(thumbnailCipher).pipe(writeStream);

            writeStream.on("finish", async() => {

                const thumbnailModel = new Thumbnail({name: filename, owner: user._id, IV: thumbnailIV, path: env.fsDirectory + thumbnailFilename});

                await thumbnailModel.save();

                const getUpdatedFile = await conn.db.collection("fs.files")
                        .findOneAndUpdate({"_id": file._id}, {"$set": {"metadata.hasThumbnail": true, "metadata.thumbnailID": thumbnailModel._id}})
    
                let updatedFile: FileInterface = getUpdatedFile.value;
    
                updatedFile = {...updatedFile, metadata: {...updatedFile.metadata, hasThumbnail: true, thumbnailID: thumbnailModel._id}} as FileInterface
    
                resolve(updatedFile);
            })

         } catch (e) {

            console.log("Thumbnail error", e);
            resolve(file);
         }
    })
}

export default createThumbnailFS;