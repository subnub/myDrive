import express, {Request, Response} from "express";
import http from "http";
import path from "path";
import bodyParser from "body-parser";
import fs from "fs";
const app = express();

const getWebUIKey = () => {

    console.log("Starting Server...\n")

    const publicPath = path.join(__dirname, "..", "..", "webUISetup");


    return new Promise<string>((resolve, reject) => {

        app.use(express.static(publicPath));
        app.use(express.json());
        app.use(bodyParser.json({limit: "50mb"}));
        app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}))

        app.post("/submit", async(req: Request, res: Response) => {

            console.log("Response")
            await createConfigFiles(req.body.clientObj, req.body.serverObj);
           
            res.send();
        })

        app.get("*", (req: Request, res: Response) => {

            res.sendFile(path.join(publicPath, "index.html"));

        })

        const port = process.env.HTTP_PORT || process.env.PORT || "3000";
        const url =  process.env.DOCKER ? undefined : "localhost";

        const server = http.createServer(app) as any;

        server.listen(port, () => {

            console.log(`\nPlease navigate to http://localhost:${port} to enter setup details\n`)
           
        });

    })
}

const awaitcreateDir = (path: any) => {

    return new Promise((resolve, reject) => {

        fs.mkdir(path, () => {
            resolve();
        })
    })
}

const awaitWriteFile = (path:string, data:string) => {

    return new Promise((resolve, reject) => {

        fs.writeFile(path, data, async(err:any) => {
    
            if (err) {
                console.log("file write error", err);
                reject();
            }
            
            resolve();
        })
    })
}

const createConfigFiles = async(clientObj: any, serverObj: any) => {

    await awaitcreateDir("./config")

    let totalClientString = "";
    let totalServerString = "";

    for (let currentKey in clientObj) {
        totalClientString += `${currentKey}=${clientObj[currentKey]}\n`
    }

    for (let currentKey in serverObj) {
        totalServerString += `${currentKey}=${serverObj[currentKey]}\n`
    }

    if (serverObj.DOCKER) {
        const combinedStrings = totalClientString + totalServerString;
        await awaitWriteFile("./docker-variables.env", combinedStrings);
    } else {
        await awaitWriteFile("./.env.production", totalClientString);
        await awaitWriteFile("./config/prod.env", totalServerString);
    }

    console.log("File(s) Created");
}

getWebUIKey();