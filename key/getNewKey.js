const prompt = require('password-prompt')
import env from "../backend/enviroment/env";
const crypto = require("crypto");

const getKey = async() => {

    let password = await prompt("Enter New Server Encryption Password: ", {method: "hide"});

    let confirmPassword = await prompt("Verify New Server Encryption Password: ", {method: "hide"});

    if (password !== confirmPassword) {
        console.log("New Passwords do not match, exiting...");
        process.exit();
    }

    password = crypto.createHash("md5").update(password).digest("hex");

    env.newKey = password;
  
}

module.exports = getKey;