const mongoose = require("../backend/db/mongooseServerUtils");
const prompts = require("prompts");
const restoreFromTempDirectory = require("./restoreFromTempDirectory");
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

const restoreDatabase = async() => {

    const userConfimation = await prompts({
        type: 'text',
        message: "Warning: This will delete ALL data," + 
        " other than the Data Backup created by CopyDatabase. \nMake sure to first run CopyDatabase, and backup" +
        " your data, \nWould you like to continue? (Yes/No)",
        name: "value"
    })

   if (!userConfimation.value || userConfimation.value.toLowerCase() !== "yes") {

        console.log("Exiting...")
        process.exit()
        return;

   } else {

        await waitForDatabase();

        await restoreFromTempDirectory();

        console.log("Finished Restoring Data, Exiting...");
        process.exit();
   }

}

restoreDatabase()

