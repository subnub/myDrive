import env from "../enviroment/env";
import getKeyFromTerminal from "../utils/getKeyFromTerminal";
import { deriveMasterKey, getOrCreateKeySalt } from "./derive-master-key";

const getKey = async () => {
  let passphrase: string | undefined;

  if (
    process.env.KEY ||
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test"
  ) {
    passphrase = process.env.KEY;

    if (!passphrase) {
      console.log(`Key is required for ${process.env.NODE_ENV} server`);
      throw new Error(`Key is required for ${process.env.NODE_ENV} server`);
    }
  } else if (process.env.NODE_ENV === "production" && !process.env.KEY) {
    passphrase = await getKeyFromTerminal();

    if (!passphrase || !passphrase.length) {
      console.log(
        "Terminal key is required for production server, or create a .env file with KEY"
      );
      throw new Error(
        "Terminal key is required for production server, or create a .env file with KEY"
      );
    }
  }

  if (!passphrase) return;

  const salt = getOrCreateKeySalt();

  // env.key is stored hex-encoded so it stays a string like the rest of
  // the env config; user-model.ts turns it back into a Buffer directly
  // (no further hashing needed - scrypt already outputs a strong 32-byte key).
  env.key = deriveMasterKey(passphrase, salt).toString("hex");
};

export default getKey;
