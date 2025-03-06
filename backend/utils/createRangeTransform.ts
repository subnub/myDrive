import crypto from "crypto";
import fs from "fs";
import { Transform } from "stream";

function incrementIV(iv: Buffer | string, blockCount: number): Buffer {
  const ivBuffer =
    typeof iv === "string" ? Buffer.from(iv, "utf8") : Buffer.from(iv);
  const result = Buffer.from(ivBuffer);
  let carry = blockCount;
  for (let i = result.length - 1; i >= 0; i--) {
    const sum = result[i] + (carry & 0xff);
    result[i] = sum & 0xff;
    carry = (carry >> 8) + (sum >> 8);
  }
  return result;
}
/**
 * Creates a transform stream that skips an initial number of bytes and then
 * emits exactly the specified number of bytes.
 *
 * @param skip - The number of bytes to discard from the beginning (extra decrypted bytes).
 * @param length - The number of bytes to output after skipping.
 * @returns A Transform stream that outputs the desired plaintext range.
 */
const createRangeTransform = (skip: number, length: number) => {
  let bytesSkipped = 0;
  let bytesPushed = 0;
  // We use "skip" and "length" to compute the desired output length.
  return new Transform({
    transform(chunk, encoding, callback) {
      let data = chunk;
      // First, skip the extra bytes in the initial block.
      if (bytesSkipped < skip) {
        if (chunk.length <= skip - bytesSkipped) {
          bytesSkipped += chunk.length;
          return callback();
        } else {
          data = chunk.slice(skip - bytesSkipped);
          bytesSkipped = skip;
        }
      }
      // Then, push only up to the requested output length.
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

/**
 * Returns a stream that reads only the necessary encrypted bytes from the file,
 * decrypts them, and outputs only the requested plaintext byte range.
 *
 * @param filePath - The path to the encrypted file.
 * @param key - The AES‑256 key (32 bytes).
 * @param iv - The initialization vector (16 bytes).
 * @param plaintextStart - The start byte offset (inclusive) of the decrypted data.
 * @param plaintextEnd - The end byte offset (inclusive) of the decrypted data.
 * @returns A stream emitting only the exact requested plaintext bytes.
 */
export const getDecryptedRangeStream = (
  encryptedStream: NodeJS.ReadableStream,
  key: Buffer | string,
  iv: Buffer | string,
  offsetInBlock: number,
  plaintextLength: number,
  startBlock: number
) => {
  console.log("getDecryptedRangeStream", offsetInBlock, plaintextLength);
  const decipher = crypto.createDecipheriv("aes256", key, iv);
  const rangeTransform = createRangeTransform(offsetInBlock, plaintextLength);
  console.log("getDecryptedRangeStream2", startBlock);

  return encryptedStream.pipe(decipher).pipe(rangeTransform);
};
