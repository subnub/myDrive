import fs from "fs";
import { UserInterface } from "../../models/user";
import { GenericParams, IStorageActions } from "./StoreTypes";

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
  async removeChunks(params: GenericParams) {
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
  async getPrevIV(params: GenericParams, start: number) {
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
}

export { FilesystemActions };
