import { GridFSBucketWriteStream } from "mongodb";
import DbUtilsFile from "../../../db/utils/fileUtils";

const dbUtilsFile = new DbUtilsFile();

const removeChunks = async(bucketStream: GridFSBucketWriteStream) => {

    const uploadID = bucketStream.id as string;

    try {
        
        if (!uploadID || uploadID.length === 0) {

            console.log("Invalid uploadID for remove chunks");
            return;
        }

        await dbUtilsFile.removeChunksByID(uploadID);

    } catch(e) {

        console.log("Could not remove chunks for canceled upload", uploadID, e);

    }
}

export default removeChunks;