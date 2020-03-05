# MyDrive

MyDrive is a Google Drive like clone, built with Node.JS, Express, and MongoDB.

MyDrive Features:

- Upload Files
- Download Files
- Create Folders
- Share Files
- Creates Image Thumbnails
- Photo-Viewer
- Stream Video
- Transcode Video
- Create One-Time Download links for files
- Move Files/Folders
- AES256 Encryption (For file chunks, tokens, and more!)
- Search For Files
- Mobile Friendly (Including Uploading!)
- Advanced Filter Options

## Installation

Required:
- Node.js (13.9+ Is Recommended)
- MongoDB

Optional:
- FFMPEG (For Video Transcoding, Does not work very well because of encryption ATM, But non-transcoded videos stream work without any issue, I do not recommend using this yet.)

Setup:
- “npm install”, Installs all dependencies. 
- "npm run init", Asks user for some environment variable details, pressing enter on these fields will instead use the default values. 

- "npm run build", This will look for the HTTPS Certificate, Place this HTTPS certificate at the root of the project, with the naming convention (certificate.ca-bundle, certificate.crt, and certificate.key). 
Note: If you do not have or want to use a HTTPS certificate, run "npm run build:no--ssl". This will run the server in production mode, without SSL encryption, this is vulnerable to man in the middle attacks!

- “npm run create-indexes-database”, This will create indexes for mongoDB, this is greatly recommended, it will improve mongoDBs speed in retrieving files. 

- "npm start" or "npm run start:no-ssl" If you do not want SSL Encryption.

- It will then ask for an encryption key, this can be whatever you would like, this key is later hashed. Do not lose this key, there is NO way to recover data from a lost key!

- That's It! Now just Create a new account.

## Built In Server Tools

MyDrive comes with some build in NPM scripts for server management, this includes:
- Backup Database: Command “npm run backup-database", creates a temporary backup of the database inside of mongoDB, please note you can only have one backup at a time, for better backups use mongoExport. 

- Restore Database: Command “npm run restore-database”, Restores Database from backup. 

- Clean Database: Command “npm run clean-database”, Cleans database, removing any orphaned chunks that do not have a file associated with them, this command will automatically run backup database, incase anything fails. 

- Change Encryption Password: Command “change-password-database”, Changed the encryption password, that the server first asks for on start up, this requires the old encryption password. This will also create a new backup, incase anything fails.

- Delete Database: Command “npm run delete-database”, Deletes the main database, does not delete the temporary backup.

- Delete Temp Database: Command “npm run delete-temp-database”, Deletes the database backup. 

- Create Indexes: Command “npm run create-indexes-database", Creates Indexes for mongoDB, without this mongoDB will need to search through every single file on request, run this before using the server. 


