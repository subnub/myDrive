const getEnvVariables = require("../dist-backend/enviroment/get-env-variables");
getEnvVariables();
const mongoose = require("./mongoServerUtil");
const conn = mongoose.connection;
const File = require("../dist-backend/models/file-model");
const User = require("../dist-backend/models/user-model");
const createVideoThumbnail =
  require("../dist-backend/services/chunk-service/utils/createVideoThumbnail").default;
const getKey = require("../dist-backend/key/get-key").default;

const waitForDatabase = () => {
  return new Promise((resolve, reject) => {
    // Wait for the database to be ready.
    const timeoutWait = () => {
      setTimeout(() => resolve(), 3000);
    };

    if (conn.readyState !== 1) {
      conn.once("open", () => {
        timeoutWait();
      });
    } else {
      timeoutWait();
    }
  });
};

// Wait to be after anything else may be printed to the terminal
const terminalWait = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 2000);
  });
};

const updateDocs = async () => {
  await terminalWait();
  console.log(`Updating video thumbnails, env is ${process.env.NODE_ENV}`);

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
  });

  console.log("Found", files.length, "files");

  for (let i = 0; i < files.length; i++) {
    try {
      const currentFile = files[i];

      console.log(`Progress ${i + 1}/${files.length}`);

      const user = await User.findById(currentFile.metadata.owner);

      await createVideoThumbnail(currentFile, currentFile.filename, user);
    } catch (e) {
      console.log("error creating video thumbnail", e);
    }
  }

  console.log("Done");

  process.exit();
};

updateDocs();
