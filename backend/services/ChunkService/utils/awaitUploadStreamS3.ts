import s3 from "../../../db/s3";

const awaitUploadStreamS3 = (params: any) => {

    return new Promise((resolve, reject) => {

        s3.upload(params, (err: any, data: any) => {

            if (err) {
                reject("Amazon upload error");
            }

            resolve();
        })

    })
}

export default awaitUploadStreamS3;