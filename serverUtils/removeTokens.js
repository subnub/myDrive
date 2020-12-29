const getEnvVariables = require("../dist/enviroment/getEnvVariables");
getEnvVariables();
const mongoose = require("./mongoServerUtil");
const conn = mongoose.connection;
const User = require("../dist/models/user");

const waitForDatabase = () => {

    return new Promise((resolve, reject) => {

        if (conn.readyState !== 1) {

            conn.once("open", () => {
                
                resolve();
    
            })

        } else {

            resolve();
        }
    
    })
}

const removeTokens = async() => {

    console.log("\nWaiting for database...");
    await waitForDatabase();
    console.log("Connected to database\n");

    console.log("Removing tokens from users...");
    const userList = await User.find({});
    await User.updateMany({}, {
        tokens: [],
        tempTokens: []
    })
    console.log("Removed tokens from", userList.length, "users");
    
    process.exit();
}

removeTokens();