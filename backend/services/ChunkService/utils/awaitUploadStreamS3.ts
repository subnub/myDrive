import { ManagedUpload } from "aws-sdk/clients/s3";
import s3 from "../../../db/connections/s3";

const uploadStreamS3 = (params: any) => {
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

export default uploadStreamS3;
