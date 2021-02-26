import AWS from "aws-sdk";
import env from "../enviroment/env";

const s3Config = {
    endpoint: env.s3Endpoint || "https://s3.amazonaws.com",
    accessKeyId: env.s3ID,
    secretAccessKey: env.s3Key,
    s3ForcePathStyle: !!env.s3Endpoint,
    signatureVersion: 'v4'
}

AWS.config.update(s3Config);

const s3 = new AWS.S3();

export default s3;
module.exports = s3;