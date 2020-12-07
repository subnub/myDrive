import {Response, Request} from "express"
const StreamSkip = require("stream-skip");

const awaitStreamVideo = (start: number, end:number, differenceStart: number, 
    decipher: any, res: Response, req: Request, streamsToErrorCatch: any[], readStream: any) => {

    return new Promise((resolve, reject) => {

        req.on("close", () => {
            // readStream.close();
            decipher.destroy();
            resolve();
        })

        req.on("end", () => {
            streamsToErrorCatch.forEach((stream) => {
                stream.destroy();
            })
            resolve();
        })

        streamsToErrorCatch.forEach((currentStream) => {

            currentStream.on("error", (e: Error) => {

                reject({
                    message: "Await Video Stream Input Error",
                    code: 500,
                    error: e
                })

            })
        })

        readStream.on("close", () => {
            decipher.destroy();
        })

        if (+start === 0 && +end === 1) {
         
            // This is for Safari/iOS, for whatever reason they ask for the
            // First byte, but if I actually try to return the first byte
            // It will not work ???, but if I return the first 4 bytes it seems
            // To work fine. 

            decipher.on("data", (data: Buffer | string) => {

                const dataCoverted = data.toString("hex");
                
                let neededData = dataCoverted.substring(0, 8);

                const dataBack = Buffer.from(neededData, "hex");

                res.write(dataBack);

                resolve();
            })
           
        } else {

            // This is where the differnce start comes into play, as I said before
            // There will be an offset caused by the 16 block size of AES256.
            // So if there was an offset we need to skip over those bytes
            // To make sure it returns the exact position the browser is requesting.
            // Most browsers will still work fine without this, such as Chrome and Firefox.
            // But one browser needs to be pampered and fed the exact right bytes in
            // Order to function correctly, can you guess what browser? If you 
            // Guessed Safari you would be correct.

            const streamSkip = new StreamSkip({skip: differenceStart});

            decipher.pipe(streamSkip).pipe(res);
        }

    })
}

export default awaitStreamVideo;