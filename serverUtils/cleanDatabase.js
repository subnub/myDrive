const mongoose = require("../backend/db/mongooseServerUtils");
const conn = mongoose.connection;
const ObjectID = require('mongodb').ObjectID
const prompts = require("prompts");
const cliProgress = require('cli-progress');
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

const moveFileChunks = async(fileID, oldDatabaseChunks, newDatabaseChunks) => {

    const listChunkCursor = await conn.db.collection(oldDatabaseChunks).find({files_id: ObjectID(fileID)});

    for await (const currentChunk of listChunkCursor) {
        
        await conn.db.collection(newDatabaseChunks).insertOne(currentChunk);
    }
}

const findFiles = async(oldDatabaseList, oldDatabaseChunks, newDatabaseChunks) => {
    
    const listCursor = await conn.db.collection(oldDatabaseList).find({});
    const listCount = await conn.db.collection(oldDatabaseList).find({}).count();
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

    progressBar.start(listCount, 0);

    for await (const currentFile of listCursor) {
        
        const fileID = currentFile._id;
        await moveFileChunks(fileID, oldDatabaseChunks, newDatabaseChunks);
        progressBar.increment();
    }

    progressBar.stop();
}

const cleanDatabase = async() => {

    console.log("Waiting For Database Connection...");
    await waitForDatabase();
    console.log("Connected To Database\n");

    const userConfimation = await prompts({
        type: 'text',
        message: "Warning: This will automatically run Backup-Database,\n" + 
        "overwriting the current Backup. And will also clear all file chunks\n" + 
        "other than the Data Backup. Then it will move only used file chunks\n" +
        "over to the Main Database. If this process fails AFTER the Automatic Backup\n" +
        "use the Restore-Database feature. \n" +
        "Would you like to continue? (Yes/No)",
        name: "value"
    })

    if (!userConfimation.value || userConfimation.value.toLowerCase() !== "yes") {

        console.log("Exiting...")
        process.exit()
        return;
    }

    console.log("Creating Temporary Collection...\n");
    await createTempDirectory();
    console.log("Temporary Collection Completed\n")
  
    console.log("Created New Backup Sucessfully\n")

    console.log("Deleting Current Chunks Collection...");
    try {
        await conn.db.collection("fs.chunks").drop();
    } catch (e) {}
    console.log("Current Chunk Collection Deleted\n");

    console.log("Moving Used Files...");
    await findFiles("temp-fs.files", "temp-fs.chunks", "fs.chunks");
    console.log("Moved All Used Files\n");

    console.log("Creating File Chunks Index...");
    await conn.db.collection("fs.chunks").createIndex({ files_id: 1, n: 1 }, { unique: true });
    console.log("Created File Chunks Index\n");

    console.log("Deleteing Current Transcoded Video Chunks Collection...");
    try {
        await conn.db.collection("videos.chunks").drop();
    } catch (e) {}
    console.log("Deleted Current Transcoded Video Chunks Collection\n")

    console.log("Moving Used Video Files...");
    await findFiles("temp-videos.files", "temp-videos.chunks", "videos.chunks");
    console.log("Moved All Used Video Files\n")

    console.log("Creating Transcoded Video Chunks Index...");
    await conn.db.collection("videos.chunks").createIndex({ files_id: 1, n: 1 }, { unique: true });
    console.log("Created Transcoded Video Chunks Index")

    process.exit();

}

cleanDatabase();