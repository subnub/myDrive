import s3 from "../../../db/s3";

const awaitUploadStreamS3 = (params: any) => {

    return new Promise((resolve, reject) => {

        s3.upload(params, (err: any, data: any) => {

            if (err) {
                console.log("Amazon Upload Error", err);
                reject("Amazon upload error");
            }

            console.log("Amazon File Uploaded", data);
            resolve();
        })

    })
}

export default awaitUploadStreamS3;