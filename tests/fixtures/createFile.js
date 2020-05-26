import mongoose from "../../dist/db/mongoose";
const conn = mongoose.connection;
const crypto = require("crypto");
const fs = require("fs");

const createFile = (filename, filepath, metadata, user) => {
    return new Promise((resolve, reject) => {

        const password = user.getEncryptionKey(); //process.env.KEY;

        const initVect = metadata.IV || crypto.randomBytes(16); 

        const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        

        const cipher = crypto.createCipheriv('aes256', CIPHER_KEY, initVect);

        const fileReadStream = fs.createReadStream(filepath);

        let bucket = new mongoose.mongo.GridFSBucket(conn.db, {
            chunkSizeBytes: 1024 * 255
        });
    
        const uploadStream = bucket.openUploadStream(filename, {metadata});

        fileReadStream.pipe(cipher).pipe(uploadStream).on("finish", (file) => {

            resolve(file);
        });
    })
}

module.exports = createFile;