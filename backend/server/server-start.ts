import getEnvVariables from "../enviroment/get-env-variables";
getEnvVariables();
import getKey from "../key/get-key";
import servers from "./server";

const { server, serverHttps } = servers;

const serverStart = async () => {
  await getKey();

  console.log("ENV", process.env.NODE_ENV);

  // Azure App Service expects HTTP on port 80 by default
  const httpPort = process.env.PORT || process.env.HTTP_PORT || 80;
  const httpsPort = process.env.HTTPS_PORT || 8080;

  // Use 0.0.0.0 for Azure compatibility (bind all interfaces)
  const host = process.env.URL || "0.0.0.0";

  if (process.env.NODE_ENV === "production" && process.env.SSL === "true") {
    server.listen(httpPort, host, () => {
      console.log("Http Server Running On Port:", httpPort);
    });

    serverHttps.listen(httpsPort, function () {
      console.log("Https Server Running On Port:", httpsPort);
    });
  } else if (process.env.NODE_ENV === "production") {
    server.listen(httpPort, host, () => {
      console.log("Http Server (No-SSL) Running On Port:", httpPort);
    });
  } else {
    server.listen(httpPort, host, () => {
      console.log("\nDevelopment Backend Server Running On :", httpPort);
    });
  }
};

serverStart();
