const mongoose = require("../backend/db/mongooseServerUtils");
const conn = mongoose.connection;
const prompts = require("prompts");
const createTempDirectory = require("./createTempDirectory");

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

const copyDatabase = async() => {

    console.log("Waiting For Database Connection...");
    await waitForDatabase();
    console.log("Connected To Database\n");

    const userConfimation = await prompts({
        type: 'text',
        message: "Warning: This will create a new Database backup, overwriting\n" + 
        "the current database backup. Only ONE Database backup\n" +
        "can Be Stored At A Time.\n" +
        "For more permanent backups, use MongoExport, or \n" +
        "Backup data manually. \n" +
        "Would you like to continue? (Yes/No)",
        name: "value"
    })

    if (!userConfimation.value || userConfimation.value.toLowerCase() !== "yes") {

        console.log("Exiting...")
        process.exit()
        return;
    }

    await createTempDirectory();

    console.log("Finished Copying Database, Exiting...");
    process.exit();
}

copyDatabase()