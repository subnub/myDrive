//import s3 from "../../../db/s3";

const removeChunksS3 = (s3: any, parmas: any) => {

    return new Promise((resolve, reject) => {

        s3.deleteObject(parmas, (err: any, data: any) => {

            if (err) {
                console.log("Could not remove S3 file");
                reject("Could Not Remove S3 File");
            }

            resolve();
        })

    })
}

export default removeChunksS3;
module.exports = removeChunksS3;