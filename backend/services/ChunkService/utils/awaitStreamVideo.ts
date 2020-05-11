import {Response, Request} from "express"
import tempStorage from "../../../tempStorage/tempStorage";
import uuid from "uuid";

const awaitStreamVideo = (start: number, end:number, differenceStart: number, 
    decipher: any, res: Response, tempUUID: string, streamsToErrorCatch: any[]) => {

    const currentUUID = uuid.v4();
    tempStorage[tempUUID] = currentUUID;

    return new Promise((resolve, reject) => {

        let firstBytesRemoved = false;
        let sizeCounter = 0;

        decipher.on("data", (data: Buffer | string) => {

            //console.log("check", tempStorage[tempUUID]);
            //console.log("check b", tempStorage[tempUUID] !== currentUUID && tempStorage[tempUUID] !== undefined);

            //console.log(tempStorage[tempUUID] !== currentUUID, tempStorage[tempUUID])
            if (tempStorage[tempUUID] !== currentUUID) {

                console.log("New Stream Requested, Desroying old stream");
                
                streamsToErrorCatch.forEach((stream) => {
                    stream.destroy();
                })

                console.log("Old Stream Desroyed");
                resolve();
                //delete tempStorage[tempUUID];
            }

            // if (tempStorage[tempUUID] !== undefined && tempStorage[tempUUID] !== currentUUID) {

            //     console.log("New Stream Requested, Desroying old stream");
            //     streamsToErrorCatch[0].destroy();
            //     console.log("Old Stream Desroyed");
            //     delete tempStorage[tempUUID];

            // } else {

            //     tempStorage[tempUUID] = currentUUID;
            // }


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