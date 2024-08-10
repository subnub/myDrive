import {Request} from "express"
import removeChunksFS from "./removeChunksFS";

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

        req.on("aborted", () => {

            removeChunksFS(path);
        })

        inputSteam.pipe(outputStream).on("finish", (data: T) => {
            resolve(data);
        })
    })
}

export default awaitUploadStream;