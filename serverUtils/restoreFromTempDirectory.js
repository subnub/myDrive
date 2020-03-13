const mongoose = require("../backend/db/mongooseServerUtils");
const cliProgress = require('cli-progress');
const conn = mongoose.connection;

const clearDirectory = async() => {

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
}

const moveItem = async(oldPath, newPath) => {

    const listCursor = await conn.db.collection(oldPath).find({});
    const listCount = await conn.db.collection(oldPath).find({}).count();
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    
    progressBar.start(listCount, 0);

    for await (const currentFile of listCursor) {
        
        await conn.db.collection(newPath).insertOne(currentFile);
        progressBar.increment();
    }

    progressBar.stop();
}


const restoreFromTempDirectory = async() => {

    console.log("\n");
    await clearDirectory();

    console.log("Moving Files...")
    await moveItem("temp-fs.files", "fs.files")
    console.log("Moved All Files\n");


    console.log(`Moving File Chunks...`);    
    await moveItem("temp-fs.chunks","fs.chunks");
    console.log("Moved All Chunks \n");

    console.log("Creating File Index...");
    await conn.db.collection("fs.chunks").createIndex({ files_id: 1, n: 1 }, { unique: true })
    console.log("File Index Created \n");

    console.log(`Moving Thumbnails...`)
    await moveItem("temp-thumbnails", "thumbnails");
    console.log("Moved All Thumbnails \n")


    console.log(`Moving Folders...`);
    await moveItem("temp-folders", "folders");
    console.log("All Folders Moved \n");


    console.log(`Moving Transcoded Video Files...`);
    await moveItem("temp-videos.files", "videos.files")
    console.log("All Transcoded Video Files Moved \n");

    
    console.log(`Moving Transcoded Video Chunks...`)
    await moveItem("temp-videos.chunks", "videos.chunks")
    console.log("All Transcoded Video Chunks Moved \n");

    console.log("Creating Transcoded Video Chunks Index...");
    await conn.db.collection("videos.chunks").createIndex({ files_id: 1, n: 1 }, { unique: true })
    console.log("Created Transcoded Video Chunks Index \n");


    console.log(`Moving Users...`)
    await moveItem("temp-users", "users")
    console.log("All Users Moved\n");
}

module.exports = restoreFromTempDirectory;