import internal from "stream";

export interface GenericParams {
  Key?: string;
  Bucket?: string;
  filePath?: string;
  [key: string]: any;
}

export interface IStorageActions {
  getAuth(): Object;
  createReadStream(
    params: GenericParams
  ): NodeJS.ReadableStream | internal.Readable;
  removeChunks(params: GenericParams): Promise<void>;
}
