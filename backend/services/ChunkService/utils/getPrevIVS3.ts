import s3 from "../../../db/s3";
import s3Auth from "../../../db/S3Personal";
import env from "../../../enviroment/env";
import {UserInterface} from "../../../models/user"

const getPrevIV = (start: number, key: string, isPersonal: boolean, user: UserInterface) => {

    return new Promise<Buffer | string>(async(resolve, reject) => {

        if (isPersonal) {

            const s3Data = await user.decryptS3Data();

            const params: any = {Bucket: s3Data.bucket, Key: key, Range: `bytes=${start}-${start + 15}`};

            const s3Storage = s3Auth(s3Data.id, s3Data.key);

            const stream = s3Storage.getObject(params).createReadStream();

            stream.on("data", (data) => {

                resolve(data);
            })

        } else {

            const params: any = {Bucket: env.s3Bucket, Key: key, Range: `bytes=${start}-${start + 15}`};

            const stream = s3.getObject(params).createReadStream();

            stream.on("data", (data) => {

                resolve(data);
            })
        }
    })
}

export default getPrevIV;