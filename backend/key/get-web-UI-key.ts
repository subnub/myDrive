import express, {Request, Response} from "express";
import http from "http";
import path from "path";
import bodyParser from "body-parser";
const app = express();

const getWebUIKey = () => {

    const publicPath = path.join(__dirname, "..", "..", "webUI");


    return new Promise<string>((resolve, reject) => {

        app.use(express.static(publicPath));
        app.use(express.json());
        app.use(bodyParser.json({limit: "50mb"}));
        app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}))

        app.post("/submit", (req: Request, res: Response) => {

            const password = req.body.password;

            if (password && password.length > 0) {

                console.log("Got WebUI key");
                res.send();
                server.close();
                resolve(password);
            }
        })

        app.get("*", (req: Request, res: Response) => {

            res.sendFile(path.join(publicPath, "index.html"));

        })

        const port = process.env.HTTP_PORT || process.env.PORT || "3000";
        const url =  process.env.DOCKER ? undefined : "localhost";

        const server = http.createServer(app) as any;

        server.listen(port, () => {

            console.log(`\nPlease navigate to http://localhost:${port} to enter encryption key\n`)
           
        });

    })
}

export default getWebUIKey;