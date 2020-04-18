const mongoose = require("mongoose");
const env = require("../enviroment/env.js");
const fs = require("fs");

if (env.useDocumentDB === "true") {

    console.log("Using DocumentDB");

    mongoose.connect(env.mongoURL, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true, 
        sslValidate: true,
        useNewUrlParser: true,
        sslCA: fs.readFileSync('./rds-combined-ca-bundle.pem')
    })

} else {

    mongoose.connect(env.mongoURL, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true, 
    })
}



module.exports = mongoose;