import {Request} from "express"
import fs from "fs";

export const removeChunksFS = (path: string) => {

    return new Promise((resolve, reject) => {

        fs.unlink(path, (err) => {

            if (err) {
                console.log("Could not remove fs file", err);
                resolve();
            }

            console.log("File Removed");
            resolve();
        })
    })
}

const awaitUploadStream = <T>(inputSteam: any, outputStream: any, req: Request, path: string, allStreamsToCatchError: any[]) => {

    return new Promise<T>((resolve, reject) => {
        
        allStreamsToCatchError.forEach((currentStream: any) => {

            currentStream.on("error", (e: Error) => {

                removeChunksFS(path);
            
                reject({
                    message: "Await Stream Input Error",
                    code: 500,
                    error: e
                })
            })
        })

        // inputSteam.on("error", (e: Error) => {

        //     removeChunksFS(path);
            
        //     reject({
        //         message: "Await Stream Input Error",
        //         code: 500,
        //         error: e
        //     })
        // })

        // outputStream.on("error", (e: Error) => {

        //     removeChunksFS(path);

        //     reject({
        //         message: "Await Stream Output Error",
        //         code: 500,
        //         error: e
        //     })
        // })

        req.on("aborted", () => {

            console.log("Upload Request Cancelling...");

            removeChunksFS(path);
        })

        inputSteam.pipe(outputStream).on("finish", (data: T) => {
            console.log("await stream finished")
            resolve(data);
        })
    })
}

export default awaitUploadStream;