import env from "../enviroment/env";
import crypto from "crypto";
import getKeyFromTerminal from "../utils/getKeyFromTerminal";

const getKey = async () => {
  if (
    process.env.KEY ||
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test"
  ) {
    const password = process.env.KEY;
    if (!password) {
      console.log(`Key is required for ${process.env.NODE_ENV} server`);
      throw new Error(`Key is required for ${process.env.NODE_ENV} server`);
    }

    env.key = crypto.createHash("md5").update(password).digest("hex");
  } else if (process.env.NODE_ENV === "production" && !process.env.KEY) {
    const terminalPassword = await getKeyFromTerminal();

    if (!terminalPassword || !terminalPassword.length) {
      console.log(
        "Terminal key is required for production server, or create a .env file with KEY"
      );
      throw new Error(
        "Terminal key is required for production server, or create a .env file with KEY"
      );
    }

    const password = crypto
      .createHash("md5")
      .update(terminalPassword)
      .digest("hex");

    env.key = password;
  }
};

export default getKey;
