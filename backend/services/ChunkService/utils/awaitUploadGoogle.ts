import request from "request";
import axios from "axios";
import { Response, Request } from "express";
import { UserInterface } from "../../../models/user";
import convertDriveToMongo from "../../../utils/convertDriveToMongo";

interface RequestType extends Request {
    user?: UserInterface,
    auth?: boolean,
    busboy: any,
}


const awaitUploadGoogle = (file: any, size: number, axiosBody: any, axiosConfigObj: any, drive: any, req: RequestType, res: Response, allStreamsToErrorCatch: any[]) => {

    return new Promise((resolve, reject) => {

        allStreamsToErrorCatch.forEach((currentStream: any) => {

            currentStream.on("error", (err: Error) => {
                console.log("req errror", err)
                reject({
                    message: "Await Stream Input Error",
                    code: 500,
                    error: err
                })
            })
        })

        axios.post("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable", axiosBody, axiosConfigObj).then((result) => {

        const URI: any = result.headers.location

        request.post({
            url: URI,
            headers: {
                "Content-Length": size,
            },
            body: file
          }, async function (e, results, b) {
            if (e) {
              console.log(e)
              return;
            }

            const jsonResults = JSON.parse(results.body)

            const retrievedFile = await drive.files.get({
                fileId: jsonResults.id,
                fields: "*"
            })

            const reqAny: any = req;
            const uploadedFile = convertDriveToMongo(retrievedFile.data, reqAny.user._id);
            res.send(uploadedFile)
            resolve()

          })

    }).catch((err) => {
        console.log("axios err", err)
    })
    })
}

export default awaitUploadGoogle;