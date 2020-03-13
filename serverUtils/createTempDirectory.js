const mongoose = require("../backend/db/mongooseServerUtils");
const conn = mongoose.connection;
const cliProgress = require('cli-progress');

const clearTempDirectory = async() => {

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

    console.log("Removed Temporary Collections\n")
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

const createTempDirectory = async() => {

    await clearTempDirectory();

    console.log("Moving Files...")
    await moveItem("fs.files", "temp-fs.files")
    console.log("Moved All Files\n");


    console.log(`Moving File Chunks...`);    
    await moveItem("fs.chunks", "temp-fs.chunks");
    console.log("Moved All Chunks \n");

    console.log("Creating Temp File Chunks Index...");
    await conn.db.collection("temp-fs.chunks").createIndex({ files_id: 1, n: 1 }, { unique: true });
    console.log("Created Temp File Chunks Index\n");

    console.log(`Moving Thumbnails...`)
    await moveItem("thumbnails", "temp-thumbnails");
    console.log("Moved All Thumbnails \n")


    console.log(`Moving Folders...`);
    await moveItem("folders", "temp-folders");
    console.log("All Folders Moved \n");


    console.log(`Moving Transcoded Video Files...`);
    await moveItem("videos.files", "temp-videos.files")
    console.log("All Transcoded Video Files Moved \n");

    
    console.log(`Moving Transcoded Video Chunks...`)
    await moveItem("videos.chunks", "temp-videos.chunks")
    console.log("All Transcoded Video Chunks Moved \n");

    console.log("Creating Temp Transcoded Video Chunks Index...");
    await conn.db.collection("videos.chunks").createIndex({ files_id: 1, n: 1 }, { unique: true })
    console.log("Created Temp Transcoded Video Chunks Index \n");


    console.log(`Moving Users...`)
    await moveItem("users", "temp-users")
    console.log("All Users Moved\n");
}

module.exports = createTempDirectory;
