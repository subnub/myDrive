import { ManagedUpload } from "aws-sdk/clients/s3";
import s3 from "../../../db/s3";

const awaitUploadStreamS3 = (
  params: any,
  personalFile: boolean,
  s3Data: { id: string; key: string; bucket: string }
) => {
  return new Promise<void>((resolve, reject) => {
    s3.upload(params, (err: any, data: ManagedUpload.SendData) => {
      if (err) {
        console.log("Amazon upload err", err);
        reject("Amazon upload error");
      }

      resolve();
    });
  });
};

export default awaitUploadStreamS3;
