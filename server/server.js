const express = require("express");
const app = express();
const path = require("path")
const publicPath = path.join(__dirname, "..", "public");
const userRouter = require("../src/express-routers/user")
const fileRouter = require("../src/express-routers/file")
const folderRouter = require("../src/express-routers/folder");
const storageRouter = require("../src/express-routers/storage");
const bodyParser = require('body-parser');
const https = require("https");
const fs = require("fs");
const helmet = require("helmet");
const busboy = require("connect-busboy")
const compression = require("compression");
const http = require("http");
const debug = require("debug")("app");

debug("-- Env ---");
debug("MONGODB_URL = %s", process.env.MONGODB_URL);
debug("FULL_URL = %s", process.env.FULL_URL);
debug("ROOT = %s", process.env.ROOT);
debug("ENABLE_VIDEO_TRANSCODING = %s", process.env.ENABLE_VIDEO_TRANSCODING);

let server;
let serverHttps;

if (process.env.NODE_ENV === 'production') {

    const cert = fs.readFileSync("certificate.crt")
    const ca = fs.readFileSync("certificate.ca-bundle");
    const key = fs.readFileSync("certificate.key");


    const options = {
        cert,
        ca,
        key
    }

    serverHttps = https.createServer(options, app);
}


server = http.createServer(app);



require("../src/db/mongoose")

app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal'])
app.use(helmet())
app.use(compression());
app.use(express.json());
app.use(express.static(publicPath));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }))

app.use(busboy({
    highWaterMark: 2 * 1024 * 1024,
}));

app.use(userRouter, fileRouter, folderRouter, storageRouter);


const nodeMode = process.env.NODE_ENV ? "Production" : "Development/Testing";

console.log("Node Enviroment Mode:", nodeMode);


app.get("*", (req, res) => {

    res.sendFile(path.join(publicPath, "index.html"))
})


if (process.env.NODE_ENV === 'production') {

    module.exports = { server, serverHttps };

} else {

    module.exports = server;
}
