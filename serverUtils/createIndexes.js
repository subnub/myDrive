const getEnvVariables = require("../dist/enviroment/getEnvVariables");
getEnvVariables();
const mongoose = require("./mongoServerUtil");
const conn = mongoose.connection;

const waitForDatabase = () => {

    return new Promise((resolve, reject) => {

        if (conn.readyState !== 1) {

            conn.once("open", () => {
                
                resolve();
    
            })

        } else {

            resolve();
        }
    
    })
}

const createIndexes = async() => {

    console.log("Waiting For Database...");
    await waitForDatabase();
    console.log("Connected To Database\n");

    console.log("Creating Indexes...")
    await conn.db.collection("fs.files").createIndex({uploadDate: 1});
    await conn.db.collection("fs.files").createIndex({uploadDate: -1});
    await conn.db.collection("fs.files").createIndex({filename: 1});
    await conn.db.collection("fs.files").createIndex({filename: -1});
    await conn.db.collection("fs.files").createIndex({"metadata.owner": 1});

    await conn.db.collection("folders").createIndex({createdAt: 1})
    await conn.db.collection("folders").createIndex({createdAt: -1})
    await conn.db.collection("folders").createIndex({name: 1});
    await conn.db.collection("folders").createIndex({name: -1})
    await conn.db.collection("folders").createIndex({owner: 1})

    await conn.db.collection("thumbnails").createIndex({owner: 1})
    console.log("Indexes Created");

    process.exit();

}

createIndexes();