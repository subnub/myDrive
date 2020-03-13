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
        message: "Warning: Deleting the Backup Database cannot be undone,\n" + 
        "Would you like to continue? (Yes/No)",
        name: "value"
    })

    if (!userConfimation.value || userConfimation.value.toLowerCase() !== "yes") {

        console.log("Exiting...")
        process.exit()
        return;
    }

    console.log("Removing Temporary Collections...");

    try {
        await conn.db.collection("temp-fs.files").drop();
    } catch (e) {}

    try {
        await conn.db.collection("temp-fs.chunks").drop();
    } catch (e) {}

    try {
        await conn.db.collection("temp-thumbnails").drop();
    } catch (e) {}

    try {
        await conn.db.collection("temp-folders").drop();
    } catch (e) {}

    try {
        await conn.db.collection("temp-videos.files").drop();
    } catch (e) {}

    try {
        await conn.db.collection("temp-videos.chunks").drop();
    } catch (e) {}

    try {
        await conn.db.collection("temp-users").drop();
    } catch (e) {}

    console.log("Removed Temporary Collections, Exiting...");
    process.exit();
}

deleteTempDatabase();