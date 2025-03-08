import crypto from "crypto";
import { Transform } from "stream";

const createRangeTransform = (skip: number, length: number) => {
  let bytesSkipped = 0;
  let bytesPushed = 0;
  return new Transform({
    transform(chunk, encoding, callback) {
      let data = chunk;
      if (bytesSkipped < skip) {
        if (chunk.length <= skip - bytesSkipped) {
          bytesSkipped += chunk.length;
          return callback();
        } else {
          data = chunk.slice(skip - bytesSkipped);
          bytesSkipped = skip;
        }
      }
      const remaining = length - bytesPushed;

      if (data.length > remaining) {
        this.push(data.slice(0, remaining));
        bytesPushed += remaining;
        this.end();
      } else {
        this.push(data);
        bytesPushed += data.length;
      }
      callback();
    },
  });
};

export const getDecryptedRangeStream = (
  encryptedStream: NodeJS.ReadableStream,
  key: Buffer | string,
  iv: Buffer | string,
  offsetInBlock: number,
  plaintextLength: number,
  startBlock: number
) => {
  const decipher = crypto.createDecipheriv("aes256", key, iv);
  decipher.setAutoPadding(false);
  const rangeTransform = createRangeTransform(offsetInBlock, plaintextLength);

  return encryptedStream.pipe(decipher).pipe(rangeTransform);
};
