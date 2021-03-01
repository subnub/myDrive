import AWS from "aws-sdk";

const s3Auth = (id:string, key:string, endpoint:string) => {

    const s3Config = {
        endpoint: endpoint || "https://s3.amazonaws.com",
        accessKeyId: id,
        secretAccessKey: key,
        s3ForcePathStyle: !!endpoint,
        signatureVersion: 'v4'
    }

    AWS.config.update(s3Config);

    const s3 = new AWS.S3();

    return s3;
}


export default s3Auth;