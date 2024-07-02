import fs from "fs";
import { UserInterface } from "../../models/user";
import { AuthParams, IStorageActions } from "./StoreTypes";

class FilesystemActions implements IStorageActions {
  async getAuth() {
    return {};
  }

  createReadStream(params: AuthParams): NodeJS.ReadableStream {
    if (!params.filePath) throw new Error("File path not configured");
    const fsReadableStream = fs.createReadStream(params.filePath);
    return fsReadableStream;
  }
  async removeChunks(params: AuthParams) {
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
}

export { FilesystemActions };
