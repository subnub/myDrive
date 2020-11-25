import {Response, Request} from "express"
import tempStorage from "../../../tempStorage/tempStorage";
import uuid from "uuid";

const awaitStreamVideo = (start: number, end:number, differenceStart: number, 
    decipher: any, res: Response, req: Request, tempUUID: string, streamsToErrorCatch: any[]) => {

    // const currentUUID = uuid.v4();
    // tempStorage[tempUUID] = currentUUID;

    return new Promise((resolve, reject) => {

        let firstBytesRemoved = false;
        //let sizeCounter = 0;

        req.on("close", () => {
            console.log("close resolved");
            streamsToErrorCatch.forEach((stream) => {
                stream.destroy();
            })
            resolve();
        })

        req.on("end", () => {
            console.log("End resolved");
            streamsToErrorCatch.forEach((stream) => {
                stream.destroy();
            })
            resolve();
        })

        decipher.on("data", (data: Buffer | string) => {

            //console.log("data", uuid.v4());


            // if (tempStorage[tempUUID] !== currentUUID) {

                
            //     streamsToErrorCatch.forEach((stream) => {
            //         stream.destroy();
            //     })

            //     resolve();
            // }

            //console.log("data", currentUUID);

            //console.log("stream passed", currentUUID);

            // if (tempStorage[tempUUID] !== undefined && tempStorage[tempUUID] !== currentUUID) {

            //     console.log("New Stream Requested, Desroying old stream");
            //     streamsToErrorCatch[0].destroy();
            //     console.log("Old Stream Desroyed");
            //     delete tempStorage[tempUUID];

            // } else {

            //     tempStorage[tempUUID] = currentUUID;
            // }

            console.log("data size", data.length)

            if (+start === 0 && +end === 1) {
                
                const dataCoverted = data.toString("hex");
                
                let neededData = dataCoverted.substring(0, 4);

                const dataBack = Buffer.from(neededData, "hex");

                res.write(dataBack);
                //res.flush();
                return;
            }

            if (!firstBytesRemoved) {

                const dataCoverted = data.toString("hex");

                let neededData = dataCoverted.substring(differenceStart * 2);

                const dataBack = Buffer.from(neededData, "hex");

                firstBytesRemoved = true;

                //sizeCounter += dataBack.length;

                res.write(dataBack);
                //res.flush();
                return;
            }


            res.write(data);
            //res.flush();
            //sizeCounter += data.length;
        })

        decipher.on("close", () => {
            console.log("decipher closed");
        })

        decipher.on("end", () => {
            console.log("decipher resolved");
            res.end();
            //resolve();
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