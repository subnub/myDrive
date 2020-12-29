import AWS from "aws-sdk";
import env from "../enviroment/env";

AWS.config.update({
    accessKeyId: env.s3ID,
    secretAccessKey: env.s3Key
});

const s3 = new AWS.S3();

export default s3;
module.exports = s3;