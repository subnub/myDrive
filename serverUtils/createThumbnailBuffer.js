import mongoose from "../backend/db/mongoose";
const conn = mongoose.connection;
const crypto= require("crypto");
import env from "../backend/enviroment/env";
const Thumbnail = require("../backend/models/thumbnail");
const ObjectID = require('mongodb').ObjectID
const sharp = require("sharp");
const concat = require("concat-stream")

const createThumbnail = async(file, filename, user, newKey) => {

    return new Promise((resolve) => {
    
        try {

        const password = newKey;

        let CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        

        let bucket = new mongoose.mongo.GridFSBucket(conn.db, {
            chunkSizeBytes: 1024 * 255,
        })
    
        const readStream = bucket.openDownloadStream(ObjectID(file._id))
    
        readStream.on("error", (e) => {
            console.log("File service upload thumbnail error", e);
            resolve(file);
        })
    
        const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, file.metadata.IV.buffer);
    
        decipher.on("error", (e) => {
            console.log("File service upload thumbnail decipher error", e);
            resolve(file)
         })
    
            const concatStream = concat(async(bufferData) => {
    
                    const thumbnailIV = crypto.randomBytes(16);
    
                    const thumbnailCipher = crypto.createCipheriv("aes256", CIPHER_KEY, thumbnailIV);
    
                    bufferData = Buffer.concat([thumbnailIV, thumbnailCipher.update(bufferData), thumbnailCipher.final()]); 
    
                    const thumbnailModel = new Thumbnail({name: filename, owner: user._id, data: bufferData});
            
                    await thumbnailModel.save();
    
                    let updatedFile = await conn.db.collection("fs.files")
                        .findOneAndUpdate({"_id": file._id}, {"$set": {"metadata.hasThumbnail": true, "metadata.thumbnailID": thumbnailModel._id}})
    
                    updatedFile = updatedFile.value;
    
                    updatedFile = {...updatedFile, metadata: {...updatedFile.metadata, hasThumbnail: true, thumbnailID: thumbnailModel._id}}
    
                    resolve(updatedFile);
        
                    }).on("error", (e) => {
                        console.log("File service upload concat stream error", e);
                        resolve(file);
                    })
    
                    const imageResize = sharp().resize(300).on("error", (e) => {
                
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

module.exports = createThumbnail;