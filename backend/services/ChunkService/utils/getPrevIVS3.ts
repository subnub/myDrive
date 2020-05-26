import s3 from "../../../db/s3";
import env from "../../../enviroment/env";

const getPrevIV = (start: number, key: string) => {

    return new Promise<Buffer | string>((resolve, reject) => {

        const params: any = {Bucket: env.s3Bucket, Key: key, Range: `bytes=${start}-${start + 15}`};

        const stream = s3.getObject(params).createReadStream();

        stream.on("data", (data) => {

            resolve(data);
        })
    })
}

export default getPrevIV;