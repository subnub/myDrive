import fs from "fs";
import { UserInterface } from "../../../models/user-model";
import { GenericParams, IStorageActions } from "../store-types";
import env from "../../../enviroment/env";
import { getFSStoragePath } from "../../../utils/getFSStoragePath";

class FilesystemActions implements IStorageActions {
  async getAuth() {
    return {};
  }

  createReadStream(params: GenericParams): NodeJS.ReadableStream {
    if (!params.filePath) throw new Error("File path not configured");
    const fsReadableStream = fs.createReadStream(params.filePath);
    return fsReadableStream;
  }
  createReadStreamWithRange(params: GenericParams, start: number, end: number) {
    if (!params.filePath) throw new Error("File path not configured");
    const fsReadableStream = fs.createReadStream(params.filePath, {
      start,
      end,
    });
    return fsReadableStream;
  }
  removeChunks(params: GenericParams) {
    return new Promise<void>((resolve, reject) => {
      if (!params.filePath) {
        reject("File path not configured");
        return;
      }
      fs.unlink(params.filePath, (err) => {
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
      if (!params.filePath) throw new Error("File path not configured");
      const stream = fs.createReadStream(params.filePath, {
        start,
        end: start + 15,
      });

      stream.on("data", (data) => {
        resolve(data);
      });
    });
  }
  uploadFile = (params: GenericParams, stream: NodeJS.ReadableStream) => {
    return new Promise<void>((resolve, reject) => {
      resolve();
    });
  };
  createWriteStream = (
    params: GenericParams,
    stream: NodeJS.ReadableStream,
    randomID: string
  ) => {
    const path = `${getFSStoragePath()}${randomID}`;
    return {
      writeStream: fs.createWriteStream(path),
      emitter: null,
    };
  };
}

export { FilesystemActions };
