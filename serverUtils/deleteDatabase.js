const mongoose = require("../backend/db/mongooseServerUtils");
const prompts = require("prompts");
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

const deleteTempDatabase = async() => {

    console.log("Waiting For Database...");
    await waitForDatabase();
    console.log("Connected To Database\n")

    const userConfimation = await prompts({
        type: 'text',
        message: "Warning: This will delete all the data in the Main Database,\n" + 
        "this will not delete any data in the Database Backup.\n" +
        "Would you like to continue? (Yes/No)",
        name: "value"
    })

    if (!userConfimation.value || userConfimation.value.toLowerCase() !== "yes") {

        console.log("Exiting...")
        process.exit()
        return;
    }

    console.log("Removing Collections...");

    try {
        await conn.db.collection("fs.files").drop();
    } catch (e) {}

    try {
        await conn.db.collection("fs.chunks").drop();
    } catch (e) {}

    try {
        await conn.db.collection("thumbnails").drop();
    } catch (e) {}

    try {
        await conn.db.collection("folders").drop();
    } catch (e) {}

    try {
        await conn.db.collection("videos.files").drop();
    } catch (e) {}

    try {
        await conn.db.collection("videos.chunks").drop();
    } catch (e) {}

    try {
        await conn.db.collection("users").drop();
    } catch (e) {}

    console.log("Removed Collections\n")

    process.exit();
}

deleteTempDatabase();