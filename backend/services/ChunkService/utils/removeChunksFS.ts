import fs from "fs";

const removeChunksFS = (path: string) => {

    return new Promise((resolve, reject) => {

        fs.unlink(path, (err) => {

            if (err) {
                console.log("Could not remove fs file", err);
                resolve();
            }

            resolve();
        })
    })
}

export default removeChunksFS;
module.exports = removeChunksFS;