const prompts = require("prompts");
const fs = require("fs");
const crypto = require("crypto");

const initServer = async() => {

    console.log("Initializing Server...\n");

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