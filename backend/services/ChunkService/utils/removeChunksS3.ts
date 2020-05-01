import s3 from "../../../db/s3";

const removeChunksS3 = (parmas: any) => {

    return new Promise((resolve, reject) => {

        s3.deleteObject(parmas, (err, data) => {

            if (err) {
                console.log("Could not remove S3 file");
                reject("Could Not Remove S3 File");
            }

            console.log("Delete S3 file");
            resolve();
        })

    })
}

export default removeChunksS3;