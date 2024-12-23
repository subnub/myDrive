import path from "path";

const getEnvVariables = () => {
  const configPath = path.join(__dirname, "..", "..", "backend", "config");

  const processType = process.env.NODE_ENV;

  if (processType === "production" || processType === undefined) {
    require("dotenv").config({ path: configPath + "/.env.production" });
  } else if (processType === "development") {
    require("dotenv").config({ path: configPath + "/.env.development" });
  } else if (processType === "test") {
    require("dotenv").config({ path: configPath + "/.env.test" });
  }
};

export default getEnvVariables;
module.exports = getEnvVariables;
