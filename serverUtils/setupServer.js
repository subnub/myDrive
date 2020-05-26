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
            message: "Enter The Client URL/IP Address (Enter The Client URL/IP Address (Must Be A Valid Link, Include Port With IP Address If Needed)",
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

        const getUseSSL = await prompts({
            type: 'toggle',
            name: 'value',
            message: "Use SSL? (Will Require SSL Certificate certificate.crt, certificate.ca-bundle, And certificate.key At Root Of The Project)",
            initial: true,
            active: 'yes',
            inactive: 'no'
        })

        const useSSL = getUseSSL.value;

        if (useSSL) {

            stringBuilder += "SSL=true\n";
        }

        stringBuilder += "DISABLE_STORAGE=true\n";
        stringBuilder += "DOCKER=true\n";
        stringBuilder += "NODE_ENV=production\n";
        stringBuilder += "PORT=3000\n";
        stringBuilder += "HTTP_PORT=3000\n"; 
        stringBuilder += "HTTPS_PORT=8080\n"

        await awaitWriteFile("./docker-variables.env", stringBuilder);

        console.log("\nCreated Docker Env File");

    } else {

        let stringBuilderClient = '';
        let stringBuilderServer = '';

        const getMongoURL = await prompts({
            type: 'text',
            message: "Enter The MongoDB URL",
            name: "value"
        })

        const mongoURL = getMongoURL.value;

        stringBuilderServer += "MONGODB_URL=" + mongoURL + "\n";

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

            stringBuilderServer += "KEY=" + key + "\n";
        }

        const getClientURL = await prompts({
            type: 'text',
            message: "Enter The Client URL/IP Address (Must Be A Valid Link, Include Port With IP Address If Needed)",
            name: "value"
        })

        const clientURL = getClientURL.value;

        stringBuilderClient += "REMOTE_URL=" + clientURL + "\n";

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

        stringBuilderServer += "DB_TYPE=" + chunkDB + "\n";

        if (chunkDB === "s3") {

            const gets3ID = await prompts({
                type: 'text',
                message: "Enter The S3 ID",
                name: "value"
            })

            const s3ID = gets3ID.value;

            stringBuilderServer += "S3_ID=" + s3ID + "\n";

            const gets3Key = await prompts({
                type: 'password',
                message: "Enter The S3 Key",
                name: "value"
            })

            const s3Key = gets3Key.value;
            
            stringBuilderServer += "S3_KEY=" + s3Key + "\n";

            const gets3Bucket = await prompts({
                type: 'text',
                message: "Enter The S3 Bucket",
                name: "value"
            })

            const s3Bucket = gets3Bucket.value;

            stringBuilderServer += "S3_BUCKET=" + s3Bucket + "\n";
            stringBuilderClient += "DISABLE_STORAGE=true\n";
            
        } else if (chunkDB === "fs") {

            const getFSPath = await prompts({
                type: 'text',
                message: "Enter The FileSystem Path",
                name: "value"
            })

            const fsPath = getFSPath.value;

            stringBuilderServer += "FS_DIRECTORY=" + fsPath + "\n";
            stringBuilderServer += "ROOT=" + fsPath + "\n"; 

        } else {

            stringBuilderClient += "DISABLE_STORAGE=true\n";
        }

        const getJWTSecret = await prompts({
            type: 'password',
            message: "Enter JWT Secret",
            name: "value",
        })

        const JWTsecret = getJWTSecret.value;

        stringBuilderServer += "PASSWORD=" + JWTsecret + "\n";

        const getUseSSL = await prompts({
            type: 'toggle',
            name: 'value',
            message: "Use SSL? (Will Require SSL Certificate certificate.crt, certificate.ca-bundle, And certificate.key At Root Of The Project)",
            initial: true,
            active: 'yes',
            inactive: 'no'
        })

        const useSSL = getUseSSL.value;

        if (useSSL) {

            stringBuilderServer += "SSL=true\n";
        }

        stringBuilderServer += "NODE_ENV=production\n";
        stringBuilderClient += "PORT=3000\n";
        stringBuilderServer += "HTTP_PORT=3000\n"; 
        stringBuilderServer += "HTTPS_PORT=8080\n"

        await awaitWriteFile("./.env.production", stringBuilderClient);
        await awaitWriteFile("./config/prod.env", stringBuilderServer);

        console.log("\nServer And Client Env Files Created");
    }
}

initServer();