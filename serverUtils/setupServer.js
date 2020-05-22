const prompts = require("prompts");
const fs = require("fs");
const crypto = require("crypto");

const awaitcreateDir = (path) => {

    return new Promise((resolve, reject) => {

        fs.mkdir(path, () => {
            resolve();
        })
    })
}

const awaitWriteFile = (path, data) => {

    return new Promise((resolve, reject) => {

        fs.writeFile(path, data, async(err) => {
    
            if (err) {
                console.log("file write error", err);
                reject();
            }
            
            resolve();
        })
    })
}

const initServer = async() => {

    console.log("Setting Up Server...\n");

    await awaitcreateDir("./config");

    const getDocker = await prompts({
        type: 'toggle',
        name: 'value',
        message: 'Use Docker With myDrive?',
        initial: true,
        active: 'yes',
        inactive: 'no'
      })

    const docker = getDocker.value;

    
    if (docker) {

        let stringBuilder = '';

        const getUsingMongo = await prompts({
            type: 'toggle',
            name: 'value',
            message: "Include MongoDB In The Docker Image? (Select No If You're Using MongoDB Atlas)",
            initial: true,
            active: 'yes',
            inactive: 'no'
        })

        const mongo = getUsingMongo.value;

        let mongoURL = "mongodb://mongo:27017/personal-drive";

        if (!mongo) {
            
            const getMongoURL = await prompts({
                type: 'text',
                message: "Enter The MongoDB URL",
                name: "value"
            })

            mongoURL = getMongoURL.value;
        }

        stringBuilder += "MONGODB_URL=" + mongoURL + "\n"
        
        const getKeyType = await prompts({
            type: 'toggle',
            name: 'value',
            message: "Use WebUI For Encryption Key (Recommended, Selecting No Will Require You To Enter An Encryption Key Now, Which Is Less Secure)",
            initial: true,
            active: 'yes',
            inactive: 'no'
        })

        let keyType = getKeyType.value;

        if (!keyType) {

            const getKey = await prompts({
                type: 'password',
                message: "Enter The Encryption Key",
                name: "value"
            })

            const key = getKey.value;

            stringBuilder += "KEY=" + key + "\n";
        }

        const getClientURL = await prompts({
            type: 'text',
            message: "Enter The Client URL/IP Address (Must Be  A Valid Link)",
            name: "value"
        })

        const clientURL = getClientURL.value;

        stringBuilder += "REMOTE_URL=" + clientURL + "\n";

        const getChunkDB = await prompts({
            type: 'select',
            name: 'value',
            message: 'Pick A Database To Store File Chunks',
            choices: [
              { title: 'Amazon S3', value: 's3'},
              { title: 'FileSystem', value: 'fs'},
              { title: 'MongoDB', value: 'mongo' },
            ],
            initial: 1
        })

        const chunkDB = getChunkDB.value;

        stringBuilder += "DB_TYPE=" + chunkDB + "\n";

        if (chunkDB === "s3") {

            const gets3ID = await prompts({
                type: 'text',
                message: "Enter The S3 ID",
                name: "value"
            })

            const s3ID = gets3ID.value;

            stringBuilder += "S3_ID=" + s3ID + "\n";

            const gets3Key = await prompts({
                type: 'password',
                message: "Enter The S3 Key",
                name: "value"
            })

            const s3Key = gets3Key.value;
            
            stringBuilder += "S3_KEY=" + s3Key + "\n";

            const gets3Bucket = await prompts({
                type: 'text',
                message: "Enter The S3 Bucket",
                name: "value"
            })

            const s3Bucket = gets3Bucket.value;

            stringBuilder += "S3_BUCKET=" + s3Bucket + "\n";
            
        } else if (chunkDB === "fs") {

            const getFSPath = await prompts({
                type: 'text',
                message: "Enter The FileSystem Path",
                name: "value"
            })

            const fsPath = getFSPath.value;

            stringBuilder += "FS_DIRECTORY=" + fsPath + "\n";
        }

        const getJWTSecret = await prompts({
            type: 'password',
            message: "Enter JWT Secret",
            name: "value",
        })

        const JWTsecret = getJWTSecret.value;

        stringBuilder += "PASSWORD=" + JWTsecret + "\n";

        stringBuilder += "DISABLE_STORAGE=true\n";
        stringBuilder += "DOCKER=true\n";
        stringBuilder += "NODE_ENV=production\n";
        stringBuilder += "PORT=3000\n";
        stringBuilder += "HTTP_PORT=3000\n"; 
        stringBuilder += "HTTPS_PORT=8080\n"

        await awaitWriteFile("./docker-variables.env", stringBuilder);

    } else {

    }



    return;

    await fs.mkdir("./config", async() => {

        const getClientPortNumber = await prompts({
            type: 'text',
            message: "Enter Client Port Number (Default 3000):",
            name: "value"
        })
        const clientPortNumber = getClientPortNumber.value || "3000";
    
        const getClientUrl = await prompts({
            type: 'text',
            message: "\nEnter Client URL (Add Port Number If Needed, Default http://localhost:3000):",
            name: "value"
        })
    
        const clientURL = getClientUrl.value || "http://localhost:3000"
    
        const getClientTranscode = await prompts({
            type: 'text',
            message: "\nEnable Transcode Video (Default False)",
            name: "value"
        })
        const clientTranscode = getClientTranscode.value || "false";
    
        let fullInfoClient = "PORT=" + clientPortNumber + "\n" 
        + "REMOTE_URL=" + clientURL
    
        console.log("client transcode", clientTranscode);
    
        if (clientTranscode.toLowerCase() === "true") {
            
            fullInfoClient = fullInfoClient + "\n" 
            + "ENABLE_VIDEO_TRANSCODING=true"
        }
    
        console.log("\nClient Into Completed, Getting Server Info...\n")
    
        const getSeverMongoURL = await prompts({
            type: 'text',
            message: "\nEnter MongoDB URL (Default mongodb://127.0.0.1:27017/personal-drive):",
            name: "value"
        })
    
        const serverMongoURL = getSeverMongoURL.value || "mongodb://127.0.0.1:27017/personal-drive"
    
        let randomPassword = crypto.randomBytes(16);
        randomPassword = randomPassword.toString("hex");
    
    
        const getServerPassword = await prompts({
            type: 'text',
            message: `\nEnter Server JSON Token Password (Default Random Password ${randomPassword}): `,
            name: "value"
        })
        const serverPassword = getServerPassword.value || randomPassword;
    
    
        const getServerHttpPort = await prompts({
            type: 'text',
            message: `\nEnter Server Http Port (Default 3000): `,
            name: "value"
        })
        const serverHttpPort = getServerHttpPort.value || "3000";
    
    
        const getServerHttpsPort =  await prompts({
            type: 'text',
            message: `\nEnter Server Https Port (Default 8080): `,
            name: "value"
        })
        const serverHttpsPort = getServerHttpsPort.value || "8080"
    
        const getServerUrl = await prompts({
            type: 'text',
            message: `\nEnter Server URL (Do Not Include Port, Default localhost):`,
            name: "value"
        })
        const serverURL = getServerUrl.value || "localhost"
    
        const getServerFullUrl = await prompts({
            type: 'text',
            message: `\nEnter Full Server URL (Include Port If Needed, Default http://localhost:3000):`,
            name: "value"
        })
        const serverFullURL = getServerFullUrl.value || "http://localhost:3000";
    
        const getServerRoot = await prompts({
            type: 'text',
            message: `\nEnter Path For Storage Size Check (Default /):`,
            name: "value"
        })
        const serverRoot = getServerRoot.value || "/";
    
        const fullServerInfo = "MONGODB_URL=" + serverMongoURL + "\n" 
        + "PASSWORD=" + serverPassword + "\n" 
        + "HTTP_PORT=" + serverHttpPort + "\n"
        + "HTTPS_PORT=" + serverHttpsPort + "\n"
        + "URL=" + serverURL + "\n" 
        + "FULL_URL=" + serverFullURL + "\n"
        + "ROOT=" + serverRoot + "\n";
    
        console.log("\nServer Info Finished, Displaying Results...\n");
    
        console.log("Client Info:\n", fullInfoClient)
    
        console.log("\nServer Info:\n", fullServerInfo)
    
        const getConfimation = await prompts({
            type: 'text',
            message: `Would You Like To Save These Files (Yes/No): `,
            name: "value"
        })
    
        if (!getConfimation.value || getConfimation.value.toLowerCase() !== "yes") {
            console.log("Exiting...")
            process.exit()
            return;
        }
    
        await fs.writeFile("./.env.production", fullInfoClient, async(err) => {
    
            if (err) {
                console.log("Error", err);
                process.exit();
            }
    
            await fs.writeFile("./config/prod.env", fullServerInfo, (err2) => {
    
                if (err2) {
                    console.log("Error", err2);
                    process.exit();
                }
            })
            
        })

    });
}

initServer();