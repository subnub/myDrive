import s3 from "../../../db/s3";
import s3Personal from "../../../db/S3Personal";

const awaitUploadStreamS3 = (params: any, personalFile: boolean, s3Data: {id: string, key: string, bucket: string}) => {

    return new Promise((resolve, reject) => {

        if (personalFile) {

            const s3PersonalAuth = s3Personal(s3Data.id, s3Data.key);

            s3PersonalAuth.upload(params, (err: any, data: any) => {

                if (err) {
                    console.log("Amazon upload personal err", err)
                    reject("Amazon upload error");
                }
    
                resolve();
            })

        } else {

            s3.upload(params, (err: any, data: any) => {

                if (err) {
                    console.log("Amazon upload err", err)
                    reject("Amazon upload error");
                }
    
                resolve();
            })
        }
    })
}

export default awaitUploadStreamS3;