import AWS from "aws-sdk";

const s3Auth = (id:string, key:string) => {

    AWS.config.update({
        accessKeyId: id,
        secretAccessKey: key
    });

    const s3 = new AWS.S3();

    return s3;
}


export default s3Auth;