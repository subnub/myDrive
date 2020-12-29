import removeChunks from "./removeChunks";
import {Request} from "express"

const awaitUploadStream = <T>(inputSteam: any, outputStream: any, req: Request, allStreamsToErrorCatch: any[]) => {

    return new Promise<T>((resolve, reject) => {

        allStreamsToErrorCatch.forEach((currentStream: any) => {

            currentStream.on("error", (e: Error) => {

                removeChunks(outputStream);
        
                reject({
                    message: "Await Stream Input Error",
                    code: 500,
                    error: e
                })
            })
        })

        req.on("aborted", () => {

            removeChunks(outputStream);
        })

        inputSteam.pipe(outputStream).on("finish", (data: T) => {
            resolve(data);
        })
    })
}

export default awaitUploadStream;