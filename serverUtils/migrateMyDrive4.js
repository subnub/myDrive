const getEnvVariables = require("../dist-backend/enviroment/get-env-variables");
getEnvVariables();
const mongoose = require("./mongoServerUtil");
const conn = mongoose.connection;
const File = require("../dist-backend/models/file-model");

const waitForDatabase = () => {
  return new Promise((resolve, reject) => {
    if (conn.readyState !== 1) {
      conn.once("open", () => {
        resolve();
      });
    } else {
      resolve();
    }
  });
};

const updateDocs = async () => {
  console.log("\nWaiting for database...");
  await waitForDatabase();
  console.log("Connected to database\n");

  console.log("Getting file list...");
  const files = await File.find({});
  console.log("Found", files.length, "files");

  for (let i = 0; i < files.length; i++) {
    const currentFile = files[i];

    await File.updateOne(
      { _id: currentFile._id },
      {
        $set: {
          "metadata.owner": currentFile.metadata.owner.toString(),
          "metadata.thumbnailID": currentFile.metadata.thumbnailID.toString(),
        },
      }
    );
  }

  console.log("Done");

  process.exit();
};

updateDocs();
