import { UserInterface } from "../../models/user";
import s3 from "../../db/s3";
import env from "../../enviroment/env";
import { AuthParams, IStorageActions } from "./StoreTypes";
import internal from "stream";

class S3Actions implements IStorageActions {
  getAuth() {
    return { s3Storage: s3, bucket: env.s3Bucket! };
  }

  createReadStream(params: AuthParams): internal.Readable {
    if (!params.Key) throw new Error("S3 not configured");
    const { s3Storage, bucket } = this.getAuth();
    const s3ReadableStream = s3Storage
      .getObject({ Key: params.Key, Bucket: bucket })
      .createReadStream();
    return s3ReadableStream;
  }

  removeChunks(params: AuthParams) {
    return new Promise<void>((resolve, reject) => {
      if (!params.Key) {
        reject("S3 not configured");
        return;
      }
      const { s3Storage, bucket } = this.getAuth();
      s3Storage.deleteObject({ Key: params.Key, Bucket: bucket }, (err) => {
        if (err) {
          reject("Error removing file");
          return;
        }
        resolve();
      });
    });
  }
}

export { S3Actions };
