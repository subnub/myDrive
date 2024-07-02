import internal from "stream";

export interface AuthParams {
  Key?: string;
  Bucket?: string;
  filePath?: string;
  [key: string]: any;
}

export interface IStorageActions {
  getAuth(): Object;
  createReadStream(
    params: AuthParams
  ): NodeJS.ReadableStream | internal.Readable;
}
