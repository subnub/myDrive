import {Request} from "express"
import fs from "fs";

const removeChunks = (path: string) => {

    return new Promise((resolve, reject) => {

        fs.unlink(path, (err) => {

            if (err) {
                console.log("Could not remove fs file", err);
            }

            console.log("File Removed");
        })
    })
}

const awaitUploadStream = <T>(inputSteam: any, outputStream: any, req: Request, path: string) => {

    return new Promise<T>((resolve, reject) => {

        inputSteam.on("error", (e: Error) => {

            removeChunks(path);
            
            reject({
                message: "Await Stream Input Error",
                code: 500,
                error: e
            })
        })

        outputStream.on("error", (e: Error) => {

            removeChunks(path);

            reject({
                message: "Await Stream Output Error",
                code: 500,
                error: e
            })
        })

        req.on("aborted", () => {

            console.log("Upload Request Cancelling...");

            removeChunks(path);
        })

        inputSteam.pipe(outputStream).on("finish", (data: T) => {
            console.log("await stream finished")
            resolve(data);
        })
    })
}

export default awaitUploadStream;