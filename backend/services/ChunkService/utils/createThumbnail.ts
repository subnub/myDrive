import mongoose from "../../../db/mongoose";
import crypto from "crypto";
import Thumbnail from "../../../models/thumbnail"; 
import { ObjectID } from "mongodb";
import sharp from "sharp";
import concat from "concat-stream";
import { FileInterface } from "../../../models/file";
import { UserInterface } from "../../../models/user";

const conn = mongoose.connection;

const createThumbnail = (file: FileInterface, filename: string, user: UserInterface) => {

    return new Promise<FileInterface>((resolve) => {

        const password = user.getEncryptionKey();

        let CIPHER_KEY = crypto.createHash('sha256').update(password!).digest()        

        let bucket = new mongoose.mongo.GridFSBucket(conn.db, {
            chunkSizeBytes: 1024 * 255
        })
    
        const readStream = bucket.openDownloadStream(new ObjectID(file._id))
    
        readStream.on("error", (e: Error) => {
            console.log("File service upload thumbnail error", e);
            resolve(file);
        })
    
        const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, file.metadata.IV);
    
        decipher.on("error", (e: Error) => {
            console.log("File service upload thumbnail decipher error", e);
            resolve(file)
         })
    
        try {
    
            const concatStream = concat(async(bufferData: Buffer) => {
    
                    const thumbnailIV = crypto.randomBytes(16); 
    
                    const thumbnailCipher = crypto.createCipheriv("aes256", CIPHER_KEY, thumbnailIV);
    
                    bufferData = Buffer.concat([thumbnailIV, thumbnailCipher.update(bufferData), thumbnailCipher.final()]);
    
                    const thumbnailModel = new Thumbnail({name: filename, owner: user._id, data: bufferData});
            
                    await thumbnailModel.save();
    
                    const getUpdatedFile = await conn.db.collection("fs.files")
                        .findOneAndUpdate({"_id": new ObjectID(file._id)}, {"$set": {"metadata.hasThumbnail": true, "metadata.thumbnailID": thumbnailModel._id}})
    
                    let updatedFile: FileInterface = getUpdatedFile.value;
    
                    updatedFile = {...updatedFile, metadata: {...updatedFile.metadata, hasThumbnail: true, thumbnailID: thumbnailModel._id}} as FileInterface;
    
                    resolve(updatedFile);
        
                    }).on("error", (e: Error) => {
                        console.log("File service upload concat stream error", e);
                        resolve(file);
                    })
    
                    const imageResize = sharp().resize(300).on("error", (e: Error) => {
                
                        console.log("resize error", e);
                        resolve(file);
                    })
    
            readStream.pipe(decipher).pipe(imageResize).pipe(concatStream);
    
                            
        } catch (e) {
    
            console.log(e);
            resolve(file);
        }
    
    })
}

export default createThumbnail;