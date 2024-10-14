const getEnvVariables = require("../dist/enviroment/get-env-variables");
getEnvVariables();
const mongoose = require("./mongoServerUtil");
const conn = mongoose.connection;
const File = require("../dist/models/file-model");
const User = require("../dist/models/user-model");
const crypto = require("crypto");
const createVideoThumbnail =
  require("../dist/services/chunk-service/utils/createVideoThumbnail").default;
const getKey = require("../dist/key/get-key").default;

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

  console.log("Getting Key...");
  await getKey();
  console.log("Key Got\n");

  //   console.log("env", process.env.KEY);

  console.log("Getting file list...");
  const files = await File.find({
    filename: {
      $regex:
        /\.(mp4|mov|avi|mkv|webm|wmv|flv|mpg|mpeg|3gp|3g2|mxf|ogv|ogg|m4v)$/i,
    },
    "metadata.thumbnailID": "",
    "metadata.owner": "670c8c321ebf0d4211617eb9",
  });

  console.log("Found", files.length, "files");

  for (let i = 0; i < files.length; i++) {
    const currentFile = files[i];

    console.log("current file", currentFile._id);

    const user = await User.findById(currentFile.metadata.owner);

    await createVideoThumbnail(currentFile, currentFile.filename, user);
  }

  console.log("Done");

  process.exit();
};

updateDocs();
