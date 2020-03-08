const prompt = require('password-prompt')
const env = require("../src/enviroment/env")
const crypto = require("crypto");

const getKey = async() => {

    if (process.env.KEY) {
        // For Docker 

        env.key = process.env.KEY

    } else if (process.env.NODE_ENV) {

        let password = await prompt("Enter Server Encryption Password: ", {method: "hide"});

        password = crypto.createHash("md5").update(password).digest("hex");

        env.key = password;

    } else {

        let password = "1234";

        password = crypto.createHash("md5").update(password).digest("hex");

        env.key = password;
    }
}

module.exports = getKey;