import mongoose from "../../../db/mongoose";
import crypto from "crypto";
import Thumbnail from "../../../models/thumbnail"; 
import sharp from "sharp";
import { FileInterface } from "../../../models/file";
import { UserInterface } from "../../../models/user";
import uuid from "uuid";
import env from "../../../enviroment/env";
import s3 from "../../../db/s3";
import s3Auth from "../../../db/S3Personal"

const conn = mongoose.connection;

const getS3Auth = async (file: FileInterface, user: UserInterface) => {

    if (file.metadata.personalFile) {

        const s3Data = await user.decryptS3Data();
        //console.log("s3 data", s3Data)
        return {s3Storage: s3Auth(s3Data.id, s3Data.key), bucket: s3Data.bucket};
    } else {
    
        return {s3Storage: s3, bucket: env.s3Bucket};
    }
}

const createThumbnailS3 = (file: FileInterface, filename: string, user: UserInterface) => {

    return new Promise<FileInterface>( async(resolve, reject) => {

        const password = user.getEncryptionKey();

        let CIPHER_KEY = crypto.createHash('sha256').update(password!).digest()       
        
        const thumbnailFilename = uuid.v4();

        const {s3Storage, bucket} = await getS3Auth(file, user);

        const isPersonalFile = file.metadata.personalFile;
    
        const params: any = {Bucket: bucket, Key: file.metadata.s3ID!};

        const readStream = s3Storage.getObject(params).createReadStream();

        const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, file.metadata.IV);

        readStream.on("error", (e: Error) => {
            console.log("File service upload thumbnail error", e);
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

            const paramsWrite: any = {
                Bucket: bucket,
                Body : readStream.pipe(decipher).pipe(imageResize).pipe(thumbnailCipher),
                Key : thumbnailFilename
            };

            s3Storage.upload(paramsWrite, async(err: any, data: any) => {

                if (err) {
                    console.log("Amazon Upload Error", err);
                    reject("Amazon upload error");
                }

                const thumbnailModel = new Thumbnail({name: thumbnailFilename, owner: user._id, IV: thumbnailIV, s3ID: thumbnailFilename, personalFile: isPersonalFile});

                await thumbnailModel.save();

                const getUpdatedFile = await conn.db.collection("fs.files")
                        .findOneAndUpdate({"_id": file._id}, {"$set": {"metadata.hasThumbnail": true, "metadata.thumbnailID": thumbnailModel._id}})
    
                let updatedFile: FileInterface = getUpdatedFile.value;
    
                updatedFile = {...updatedFile, metadata: {...updatedFile.metadata, hasThumbnail: true, thumbnailID: thumbnailModel._id}} as FileInterface;
    
                resolve(updatedFile);
            })

         } catch (e) {

            console.log("Thumbnail error", e);
            resolve(file);
         }
    })
}

export default createThumbnailS3;