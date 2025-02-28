import express, { Request, Response } from "express";
import path from "path";
import userRouter from "../express-routers/user-router";
import fileRouter from "../express-routers/file-router";
import folderRouter from "../express-routers/folder-router";
import bodyParser from "body-parser";
import https from "https";
import fs from "fs";
import helmet from "helmet";
import busboy from "connect-busboy";
import compression from "compression";
import http from "http";
import cookieParser from "cookie-parser";
import env from "../enviroment/env";
import { middlewareErrorHandler } from "../middleware/utils/middleware-utils";
import cors from "cors";
// import requestIp from "request-ip";

const app = express();
const publicPath = path.join(__dirname, "..", "..", "dist-frontend");

let server: any;
let serverHttps: any;

if (process.env.SSL === "true") {
  const certPath = env.httpsCrtPath || "certificate.crt"
  const caPath = env.httpsCaPath || "certificate.ca-bundle"
  const keyPath = env.httpsKeyPath || "certificate.key"
  const cert = fs.readFileSync(certPath);
  const ca = fs.readFileSync(caPath);
  const key = fs.readFileSync(keyPath);

  const options = {
    cert,
    ca,
    key,
  };

  serverHttps = https.createServer(options, app);
}

server = http.createServer(app);

require("../db/connections/mongoose");

app.use(cors());
app.use(cookieParser(env.passwordCookie));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.static(publicPath, { index: false }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
// app.use(requestIp.mw());

app.use(
  busboy({
    highWaterMark: 2 * 1024 * 1024,
  })
);

app.use(userRouter, fileRouter, folderRouter);

app.use(middlewareErrorHandler);

//const nodeMode = process.env.NODE_ENV ? "Production" : "Development/Testing";

//console.log("Node Enviroment Mode:", nodeMode);

if (process.env.NODE_ENV === "production") {
  app.get("*", (_: Request, res: Response) => {
    res.sendFile(path.join(publicPath, "index.html"));
  });
}

export default { server, serverHttps };
