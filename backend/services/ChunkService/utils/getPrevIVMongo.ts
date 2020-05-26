import mongoose from "../../../db/mongoose";
import { ObjectID } from "mongodb"
const conn = mongoose.connection;

const getPrevIV = (start: number, fileID: string) => {

    return new Promise<Buffer | string>((resolve, reject) => {

        const bucket = new mongoose.mongo.GridFSBucket(conn.db);

        const stream = bucket.openDownloadStream(new ObjectID(fileID), {
            start: start,
            end: start + 16
        });

        stream.on("data", (data) => {

            resolve(data);
        })
    })
}

export default getPrevIV;