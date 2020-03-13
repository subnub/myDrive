const DbUtilsFile = require("../../../db/utils/fileUtils");
const dbUtilsFile = new DbUtilsFile();

const removeChunks = async(bucketStream) => {

    try {

        const uploadID = bucketStream.id;
        
        if (!uploadID || uploadID.length === 0) {

            console.log("Invalid uploadID for remove chunks");
            return;
        }

        await dbUtilsFile.removeChunksByID(uploadID);
        console.log("Upload Request Cancelled, Chunks Removed");

    } catch(e) {

        console.log("Could not remove chunks for canceled upload", uploadID, e);

    }
}

module.exports = removeChunks;