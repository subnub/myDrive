const path = require("path");

const getEnvVariables = () => {

    const configPath = path.join(__dirname, "..", "config");

    require('dotenv').config({ path: configPath + "/prod.env"})
}

module.exports = getEnvVariables;