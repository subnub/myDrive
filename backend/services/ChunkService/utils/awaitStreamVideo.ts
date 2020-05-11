import {Response, Request} from "express"

const awaitStreamVideo = (start: number, end:number, differenceStart: number, 
    decipher: any, res: Response, streamsToErrorCatch: any[]) => {

    return new Promise((resolve, reject) => {

        let firstBytesRemoved = false;
        let sizeCounter = 0;

        decipher.on("data", (data: Buffer | string) => {

            if (+start === 0 && +end === 1) {
                
                const dataCoverted = data.toString("hex");
                
                let neededData = dataCoverted.substring(0, 4);

                const dataBack = Buffer.from(neededData, "hex");

                res.write(dataBack);
                res.flush();
                return;
            }

            if (!firstBytesRemoved) {

                const dataCoverted = data.toString("hex");

                let neededData = dataCoverted.substring(differenceStart * 2);

                const dataBack = Buffer.from(neededData, "hex");

                firstBytesRemoved = true;

                sizeCounter += dataBack.length;

                res.write(dataBack);
                res.flush();
                return;
            }


            res.write(data);
            res.flush();
            sizeCounter += data.length;
        })

        decipher.on("end", () => {
            res.end();
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

    })
}

export default awaitStreamVideo;