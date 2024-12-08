import s3 from "../../../db/connections/s3";
import env from "../../../enviroment/env";
import { GenericParams, IStorageActions } from "../store-types";
import internal, { EventEmitter } from "stream";
import { PassThrough } from "stream";
import stream from "stream";

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
    readStream: NodeJS.ReadableStream,
    randomID: string
  ) => {
    const passThrough = new stream.PassThrough();
    const emitter = new EventEmitter();

    const { s3Storage, bucket } = this.getAuth();

    s3Storage.upload(
      { Bucket: bucket, Body: passThrough, Key: randomID },
      (err) => {
        if (err) {
          emitter.emit("error", err);
          return;
        }
        emitter.emit("finish");
      }
    );

    return { writeStream: passThrough, emitter };
  };
}

export { S3Actions };
