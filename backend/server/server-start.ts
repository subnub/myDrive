import getEnvVariables from "../enviroment/get-env-variables";
getEnvVariables();
import getKey from "../key/get-key";
import servers from "./server";

const { server, serverHttps } = servers;

const serverStart = async () => {
  await getKey();

  console.log("ENV", process.env.NODE_ENV);

  const httpPort = process.env.HTTP_PORT || process.env.PORT || 3000;
  const httpsPort = process.env.HTTPS_PORT || 8080

  if (process.env.NODE_ENV === "production" && process.env.SSL === "true") {
    server.listen(httpPort, process.env.URL, () => {
      console.log("Http Server Running On Port:", httpPort);
    });

    serverHttps.listen(httpsPort, function () {
      console.log("Https Server Running On Port:", httpsPort);
    });
  } else if (process.env.NODE_ENV === "production") {
    server.listen(httpPort, process.env.URL, () => {
      console.log("Http Server (No-SSL) Running On Port:", httpPort);
    });
  } else {
    server.listen(httpPort, process.env.URL, () => {
      console.log("\nDevelopment Backend Server Running On :", httpPort);
    });
  }
};

serverStart();
