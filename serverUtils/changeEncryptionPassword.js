const mongoose = require("../backend/db/mongooseServerUtils");
const conn = mongoose.connection;
const ObjectID = require('mongodb').ObjectID
const imageChecker = require("../src/utils/imageChecker");
const createThumbnail = require("./createThumbnailBuffer");
const prompts = require("prompts");
const getKey = require("../key/getKey");
const getNewKey = require("../key/getNewKey");
const crypto = require("crypto");
const env = require("../backend/enviroment/env");
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

const reencryptFile = (file, newKey, user) => {

    return new Promise(async(resolve, reject) => {

        const fileID = file._id;
        const filename = file.filename;

        let decryptBucket = new mongoose.mongo.GridFSBucket(conn.db, {
            chunkSizeBytes: 1024 * 255,
            bucketName: "temp-fs"
        });
    
        let bucket = new mongoose.mongo.GridFSBucket(conn.db, {
            chunkSizeBytes: 1024 * 255
        });
    
        const metadata = file.metadata;
    
        const readStream = decryptBucket.openDownloadStream(ObjectID(fileID));
    
        const writeStream = bucket.openUploadStream(filename, {metadata});
    
        const foundOldUser =  await conn.db.collection("temp-users").findOne({_id: user._id});

        const password = getOldEncryptionKey(foundOldUser);

        const IV = file.metadata.IV.buffer

        const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()   
                
        const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, IV);
                
        const NEW_CIPHER_KEY = crypto.createHash('sha256').update(newKey).digest() 
    
        const cipher = crypto.createCipheriv('aes256', NEW_CIPHER_KEY, IV);

        cipher.on("error", (e) => {
            console.log("de", e);
        })

        readStream.pipe(decipher).pipe(cipher).pipe(writeStream);

        writeStream.on("finish", async(newFile) => {

            const imageCheck = imageChecker(filename);

            if (file.length < 15728640 && imageCheck) {

               try {
                    await createThumbnail(newFile, filename, user, newKey);
               } catch (e) {
                   console.log("Cannot create thumbnail", e);
               }
                
                resolve();

            } else {

                resolve();
            }

        })

    })
}


const findFiles = async() => {

    const userListCursor = await conn.db.collection("users").find({});
    const userListCount = await conn.db.collection("users").find({}).count();
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

    progressBar.start(userListCount, 0);

    for await (const currentUser of userListCursor) {

        const currentUserID = currentUser._id;
    
        const newEncrpytionKey = getEncryptionKey(currentUser);

        const listCursor = await conn.db.collection("temp-fs.files").find({"metadata.owner": ObjectID(currentUserID)});

        for await (const currentFile of listCursor) {

            await reencryptFile(currentFile, newEncrpytionKey, currentUser);
        }

        progressBar.increment()
    }

    progressBar.stop();
}

const generateEncryptionKeys = async(user) => {

    const userPassword = user.password;
    const masterPassword = env.newKey;

    const randomKey = crypto.randomBytes(32);

    const iv = crypto.randomBytes(16);
    const USER_CIPHER_KEY = crypto.createHash('sha256').update(userPassword).digest();
    const cipher = crypto.createCipheriv('aes-256-cbc', USER_CIPHER_KEY, iv);
    let encryptedText = cipher.update(randomKey);
    encryptedText = Buffer.concat([encryptedText, cipher.final()]);

    const MASTER_CIPHER_KEY = crypto.createHash('sha256').update(masterPassword).digest();
    const masterCipher = crypto.createCipheriv('aes-256-cbc', MASTER_CIPHER_KEY, iv);
    let masterEncryptedText = masterCipher.update(encryptedText);
    masterEncryptedText = Buffer.concat([masterEncryptedText, masterCipher.final()]).toString("hex");

    user.privateKey = masterEncryptedText;
    user.publicKey = iv.toString("hex");

    return user;
}

const getOldEncryptionKey = (user) => {

    const userPassword = user.password;
    const masterEncryptedText = user.privateKey;
    const masterPassword = env.key;
    const iv = Buffer.from(user.publicKey, "hex");

    const USER_CIPHER_KEY = crypto.createHash('sha256').update(userPassword).digest();
    const MASTER_CIPHER_KEY = crypto.createHash('sha256').update(masterPassword).digest();

    const unhexMasterText = Buffer.from(masterEncryptedText, "hex");
    const masterDecipher = crypto.createDecipheriv('aes-256-cbc', MASTER_CIPHER_KEY, iv)
    let masterDecrypted = masterDecipher.update(unhexMasterText);
    masterDecrypted = Buffer.concat([masterDecrypted, masterDecipher.final()])

    let decipher = crypto.createDecipheriv('aes-256-cbc', USER_CIPHER_KEY, iv);
    let decrypted = decipher.update(masterDecrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted;
}

const getEncryptionKey = (user) => {

    const userPassword = user.password;
    const masterEncryptedText = user.privateKey;
    const masterPassword = env.newKey;
    const iv = Buffer.from(user.publicKey, "hex");

    const USER_CIPHER_KEY = crypto.createHash('sha256').update(userPassword).digest();
    const MASTER_CIPHER_KEY = crypto.createHash('sha256').update(masterPassword).digest();

    const unhexMasterText = Buffer.from(masterEncryptedText, "hex");
    const masterDecipher = crypto.createDecipheriv('aes-256-cbc', MASTER_CIPHER_KEY, iv)
    let masterDecrypted = masterDecipher.update(unhexMasterText);
    masterDecrypted = Buffer.concat([masterDecrypted, masterDecipher.final()])

    let decipher = crypto.createDecipheriv('aes-256-cbc', USER_CIPHER_KEY, iv);
    let decrypted = decipher.update(masterDecrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted;
}

const findUsers = async() => {

    const listCursor = await conn.db.collection("temp-users").find({});
    const listCount = await conn.db.collection("temp-users").find({}).count();
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

    progressBar.start(listCount, 0);

    for await (const currentUser of listCursor) {

       try {

        const newUser = await generateEncryptionKeys(currentUser);
       
        await conn.db.collection("users").insertOne(newUser);

        progressBar.increment()

       } catch (e) {
           console.log("e", e);
       }
    }

    progressBar.stop();

}

const changeEncryptionPassword = async() => {

    console.log("Waiting For Database...");
    await waitForDatabase();
    console.log("Connected To Database...\n");

    const userConfimation = await prompts({
        type: 'text',
        message: "Warning: This will automatically run Backup-Database,\n" + 
        "overwriting the current Backup. And will also clear all file chunks\n" + 
        "other than the Data Backup. Then it will re-encrypt files and move them back over.\n" +
        "(Optional) Create a manual Backup for additional safety.\n" +
        "Would you like to continue? (Yes/No)",
        name: "value"
    })

    if (!userConfimation.value || userConfimation.value.toLowerCase() !== "yes") {

        console.log("Exiting...")
        process.exit()
        return;
    }

    console.log("\nGetting Old Password...");
    await getKey();
    console.log("Got Key\n")

    console.log("Getting New Password...");
    await getNewKey();
    console.log("Got New Key\n");

    console.log("Creating Temporary Collection...\n");
    await createTempDirectory();
    console.log("Temporary Collection Completed\n")

    console.log("Created New Backup Sucessfully\n")

    console.log("Deleting Current Chunks Collection...");
    try {
        await conn.db.collection("fs.chunks").drop();
    } catch (e) {}
    console.log("Current Chunk Collection Deleted\n");

    console.log("Deleting Current File Collection...");
    try {
        await conn.db.collection("fs.files").drop();
    } catch (e) {}
    console.log("Deleted Current File Collection\n")

    console.log("Delete Current Users...");
    try {
        await conn.db.collection("users").drop();
    } catch (e) {}
    console.log("Current Users Deleted\n");

    console.log("Deleting Current Thumbnails...");
    try {
        await conn.db.collection("thumbnails").drop();
    } catch (e) {}
    console.log("Deleted Current Thumbnails\n");

    console.log("Generating User Encryption Keys...");
    await findUsers();
    console.log("Generated User Encryption Keys\n")

    console.log("Moving Files By User...");
    await findFiles();
    console.log("Moved All Files...\n")

    process.exit();
}

changeEncryptionPassword();