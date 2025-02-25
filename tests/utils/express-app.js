const express = require("express");
// const requestIp = require("request-ip");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const compression = require("compression");
const busboy = require("connect-busboy");
const userRouter =
  require("../../dist-backend/express-routers/user-router").default;
const fileRouter =
  require("../../dist-backend/express-routers/file-router").default;
const folderRouter =
  require("../../dist-backend/express-routers/folder-router").default;
const env = require("../../dist-backend/enviroment/env");
const middlewareErrorHandler =
  require("../../dist-backend/middleware/utils/middleware-utils").middlewareErrorHandler;
const getEnviromentVariables = require("../../dist-backend/enviroment/get-env-variables");

process.env.NODE_ENV = "test";

getEnviromentVariables();

const app = express();

app.use(cookieParser(env.passwordCookie));
app.use(helmet());
app.use(compression());
app.use(express.json());
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

module.exports = app;
