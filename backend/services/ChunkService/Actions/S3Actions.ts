import s3 from "../../../db/s3";
import env from "../../../enviroment/env";
import { GenericParams, IStorageActions } from "./../StoreTypes";
import internal from "stream";
import { PassThrough } from "stream";

class S3Actions implements IStorageActions {
  getAuth() {
    return { s3Storage: s3, bucket: env.s3Bucket! };
  }

  createReadStream(params: GenericParams): internal.Readable {
    if (!params.Key) throw new Error("S3 not configured");
    const { s3Storage, bucket } = this.getAuth();
    const s3ReadableStream = s3Storage
      .getObject({ Key: params.Key, Bucket: bucket })
      .createReadStream();
    return s3ReadableStream;
  }

  createReadStreamWithRange(
    params: GenericParams,
    start: number,
    end: number
  ): internal.Readable {
    if (!params.Key) throw new Error("S3 not configured");
    const range = `bytes=${start}-${end}`;
    const { s3Storage, bucket } = this.getAuth();
    const s3ReadableStream = s3Storage
      .getObject({ Key: params.Key, Bucket: bucket, Range: range })
      .createReadStream();
    return s3ReadableStream;
  }

  removeChunks(params: GenericParams) {
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
  getPrevIV(params: GenericParams, start: number) {
    return new Promise<Buffer | string>((resolve, reject) => {
      if (!params.Key) throw new Error("S3 not configured");
      const { s3Storage, bucket } = this.getAuth();
      const range = `bytes=${start}-${start + 15}`;

      const stream = s3Storage
        .getObject({ Key: params.Key, Bucket: bucket, Range: range })
        .createReadStream();

      stream.on("data", (data) => {
        resolve(data);
      });
    });
  }
  createWriteStream = (
    params: GenericParams,
    stream: NodeJS.ReadableStream,
    randomID: string
  ) => {
    const pass = new PassThrough();

    const { Key } = params;
    if (!Key) throw new Error("S3 not configured");
    const { s3Storage, bucket } = this.getAuth();

    s3Storage.upload({ Bucket: bucket, Body: stream, Key: randomID }, (err) => {
      if (err) {
        console.log("Amazon upload err", err);
        pass.emit("error", err);
      }
    });

    return pass;
  };
}

export { S3Actions };
