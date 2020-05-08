const prompt = require('password-prompt')
import env from "../enviroment/env";
import crypto from "crypto";

const getKey = async() => {

    if (process.env.KEY) {
        // For Docker 

        env.key = process.env.KEY

    } else if (process.env.NODE_ENV === "production") {

        let password: string = await prompt("Enter Server Encryption Password: ", {method: "hide"});

        password = crypto.createHash("md5").update(password).digest("hex");

        env.key = password;

    } else {

        let password = "1234";

        password = crypto.createHash("md5").update(password).digest("hex");

        env.key = password;
    }
}

export default getKey;