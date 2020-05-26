import mongoose from "mongoose";
import env from "../enviroment/env";
import fs from "fs";

const DBUrl = env.mongoURL as string;

if (env.useDocumentDB === "true") {

    console.log("Using DocumentDB");

    if (env.documentDBBundle === "true") {

        const fileBuffer = fs.readFileSync('./rds-combined-ca-bundle.pem');
        const mongooseCertificateConnect = mongoose as any;

        mongooseCertificateConnect.connect(DBUrl, {
            
            useCreateIndex: true,
            useUnifiedTopology: true, 
            sslValidate: true,
            sslCA: fileBuffer
        })
    
    } else {

        mongoose.connect(DBUrl, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true, 
            sslValidate: true,
        })
    } 

} else {

    mongoose.connect(DBUrl, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true, 
    })
}

export default mongoose;