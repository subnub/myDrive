const getEnvVariables = require("../dist/enviroment/getEnvVariables");
getEnvVariables()
const mongoose = require("./mongoServerUtil");
const conn = mongoose.connection;
const env = require("../dist/enviroment/env")
const DbUtilsFile = require("../dist/db/utils/fileUtils/index")
const dbUtilsFile = new DbUtilsFile();
const Thumbnail = require("../dist/models/thumbnail");
const removeChunksFS = require("../dist/services/ChunkService/utils/removeChunksFS");
const File = require("../dist/models/file");
const mongod = require("mongodb");
const ObjectID = mongod.ObjectID;
const User = require('../dist/models/user');
const s3 = require("../dist/db/s3");
const Stripe = require("stripe")
const removeChunksS3 = require("../dist/services/ChunkService/utils/removeChunksS3");
const getKey = require("../key/getKey");

const stripKey = env.stripeKey;

const DAY_LIMIT = 30;

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

const mongoRemoveChunks = async(fileList) => {

    for (const file of fileList) {

        const fileID = file._id;

        let bucket = new mongoose.mongo.GridFSBucket(conn.db, {
            chunkSizeBytes: 1024 * 255,
        });
    
        if (file.metadata.thumbnailID) {
    
            await Thumbnail.deleteOne({_id: file.metadata.thumbnailID});
        }
    
        await bucket.delete(new ObjectID(fileID));

    }
}

const fsRemoveChunks = async(fileList) => {

    for (const file of fileList) {

        if (file.metadata.thumbnailID) {

            const thumbnail = await Thumbnail.findById(file.metadata.thumbnailID)
            const thumbnailPath = thumbnail.path;
            await removeChunksFS(thumbnailPath);
    
            await Thumbnail.deleteOne({_id: file.metadata.thumbnailID});
        }

        await removeChunksFS(file.metadata.filePath);
        await File.deleteOne({_id: file._id});
    }
}

const s3RemoveChunks = async(fileList) => {

    for (const file of fileList) {

        const s3Storage = s3;
        const bucket = env.s3Bucket;

        if (file.metadata.thumbnailID) {

            const thumbnail = await Thumbnail.findById(file.metadata.thumbnailID);
            const paramsThumbnail = {Bucket: bucket, Key: thumbnail.s3ID};
            await removeChunksS3(s3Storage, paramsThumbnail);
            await Thumbnail.deleteOne({_id: file.metadata.thumbnailID});
        }

        const params = {Bucket: bucket, Key: file.metadata.s3ID};
        await removeChunksS3(s3Storage, params);
        await File.deleteOne({_id: file._id});
    }

}

const removeChunkData = async(user) => {

    const fileList = await conn.db.collection("fs.files").find({
        "metadata.owner": user._id,
        "metadata.personalFile": null,
    }).toArray();

    // console.log("file list", fileList.length);

    if (env.dbType === "mongo") {

        await mongoRemoveChunks(fileList);

    } else if (env.dbType === "fs") {

        await fsRemoveChunks(fileList); 
    
    } else {

        await s3RemoveChunks(fileList);
    }
}

const removeFolders = async(user) => {

    // console.log("removing folders", user._id)

    await conn.db.collection("folders").deleteMany({
        owner: user._id.toString(),
        personalFolder: null
    })
}

const removeOldSubscriptionData = async() => {

    console.log("Getting Encryption Password");
    await getKey();
    console.log("Got encryption key\n")

    console.log("Waiting for mongoDB Database...");
    await waitForDatabase();
    console.log("MongoDB Connection established\n")

    console.log("Starting expire data check...")

    const allUsers = await User.find({});

    console.log("All users length", allUsers.length);

    for (const currentUser of allUsers) {
        
        if (currentUser.stripeCanceledDate) {
         
            let date = new Date(currentUser.stripeCanceledDate);
            date.setDate(date.getDate() + DAY_LIMIT);

            const nowDate = new Date();

            if (date.getTime() <= nowDate) {

                console.log(`\nUser ${currentUser.email} over expire limit, deleting data...`);
                await removeChunkData(currentUser)
                await removeFolders(currentUser)
                console.log(`Removed user ${currentUser.email} data successfully`);
            }

        } else if (currentUser.stripeEnabled) {

            const stripe = new Stripe(stripKey, {
                apiVersion: '2020-03-02',
            });
            
            const {subID}= await currentUser.decryptStripeData();

            const subscriptionDetails = await stripe.subscriptions.retrieve(subID);

            if (subscriptionDetails.status !== "active" && subscriptionDetails.status !== "trailing") {
                
                const endedAt = (subscriptionDetails.ended_at * 1000);
                
                let date = new Date(endedAt);
                date.setDate(date.getDate() + DAY_LIMIT);
                const nowDate = new Date();

                if (date.getTime() <= nowDate) {

                    console.log(`\nUser ${currentUser.email} over expire limit, deleting data...`);
                    await removeChunkData(currentUser)
                    await removeFolders(currentUser)
                    console.log(`Removed user ${currentUser.email} data successfully`);
                }
            }


        }
    }

    console.log("\nFinished removing all expired data")
    process.exit()
} 

removeOldSubscriptionData()