const getEnvVariables = require("../dist/enviroment/getEnvVariables");
getEnvVariables()
const mongoose = require("./mongoServerUtil");
const conn = mongoose.connection;
const Thumbnail = require("../dist/models/thumbnail");
const File = require("../dist/models/file");
const User = require('../dist/models/user');

const DAY_LIMIT = 0;

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

const removePersonalMetadata = async(user) => {

    const fileList =  await conn.db.collection("fs.files").find({
        "metadata.owner": user._id,
        "metadata.personalFile": true,
    }).toArray();

    for (let currentFile of fileList) {

        await File.deleteOne({_id: currentFile._id});

        if (currentFile.metadata.hasThumbnail) {

            await Thumbnail.deleteOne({_id: currentFile.metadata.thumbnailID})
        }
    }

    await conn.db.collection("folders").deleteMany({'owner': user._id.toString(), 'personalFolder': true})
}

const removeOldPeronsalData = async() => {

    console.log("Waiting for mongoDB Database...");
    await waitForDatabase();
    console.log("MongoDB Connection established\n");

    const userList = await User.find({'personalStorageCanceledDate': {$exists: true}});

    console.log('user list', userList.length);

    for (const currentUser of userList) {

        let date = new Date(currentUser.personalStorageCanceledDate);
        date.setDate(date.getDate() + DAY_LIMIT);

        const nowDate = new Date();

        if (date.getTime() <= nowDate) {
            console.log(`\nUser ${currentUser.email} over expire limit for personal data, deleting metadata...`);
            await removePersonalMetadata(currentUser);
            console.log(`Removed user ${currentUser.email} personal metadata successfully`);
        }
    }

    console.log('\nFinished removing expired personal metadata')
    process.exit();
}

removeOldPeronsalData();