# ![MyDrive Homepage](github_images/mydrivehome2.png)

# MyDrive

MyDrive is an Open Source Cloud Server (Similar To Google Drive), the service uses mongoDB to store file/folder meta data, and supports multiple databases to store the file chunks, such as Amazon S3, the Filesystem, or just MongoDB. MyDrive is built using Node.js, and Typescript. The service now even supports Docker images! 

## Index

* [Features](#features)
* [Installation](#installation)
* [Key](#key)(WebUI for Encryption key)
* [Wiki](https://github.com/subnub/myDrive/wiki)
* [Demo](#demo)
* [Screenshots](#screenshots)

## Features

* Upload Files
* Download Files
* Share Files
* Mutilple DB Support (MongoDB, S3, Filesystem)
* Photo Viewer
* Video Viewer
* Thumbnails
* One-time download links
* Move Folder/Files
* Mobile Support
* Docker Support
* Search/Filter Options
* AES256 Encryption

## Installation

Required:
- Node.js (13+ Recommended)
- MongoDB (Unless using a service like Atlas)

Windows users will usually need both the microsoft visual build tools, and python 2. These are required to build the sharp module:
- Visual Tools: http://go.microsoft.com/fwlink/?LinkId=691126
- Python 2: https://www.python.org/downloads/release/python-2717/

Linux users will need to make sure they have 'build-essential' installed:
```bash
sudo apt-get install build-essential
```

Setup:
>Install Node Modules
``` javascript
npm install
```

>Create Enviroment Variables, Users can use the built in command to easily create the needed Enviroment files, or view the Enviroment Variables section to see how to manually create the files. 
``` javascript
npm run setup
```

>Run the build command
``` javascript
npm run build
```

>(Optional) Create the MongoDB indexes, this increases performace. MongoDB must be running for this command to work.
```javascript
npm run create-indexes-database
```

>Start the server
``` javascript
npm run start
```

## Key
# WebUI For Encryption Key

MyDrive will first host a server on http://localhost:3000 in order to safely get the encryption key, just navigate to this URL in a browser, and enter the encryption key. 

If you're using a service like SSH or a Droplet, you can forward the localhost connection safely like so:
```bash
ssh -L localhost:3000:localhost:3000 username@ip_address
```

Note: You can also disable using the webUI for the encryption key by providing a key in the server enviroment variables (e.g. KEY=password), but this is not recommended because it greatly reduces security. 

## Demo

Demo: https://mydrive-demo.herokuapp.com/
- Note: The Upload and Download Features, and other core features, are disabled in the demo. 

## Screenshots

## Enviroment Variables

Create a config folder on the root of the project, and create a file with the name prod.env for the server. For the client variables create a .env.production file in the root of the project. 

Server Enviroment Variables:

- MONGODB_URL (Required): Sets the MongoDB URL, this should also work with DocumentDB. 
- HTTP_PORT (Required): Sets the HTTP port number.
- HTTPS_PORT (Required): Sets the HTTPS port number.
- PASSWORD (Required): Sets the JWT password. 
- DB_TYPE (Required): Sets the Database Type, options include s3/mongo/fs.
- NODE_ENV (Required): Must be set to 'production'.
- SSL (Optional): Enables SSL, place certificate.crt, certificate.ca-bundle, and certificate.key at the root of the project.
- KEY (Optional): Encryption key for data, this is not recommended, please use the built in webUI for setting the key.
- DOCKER (Optional/Required): Sets the server to use docker, set this to true.
- FS_DIRECTORY (Optional/Required): Sets the directory for file data on the file system. 
- S3_ID (Optional/Required): Sets the Amazon S3 ID.
- S3_KEY (Optional/Required): Sets the Amazon S3 Key.
- S3_BUCKET (Optional/Required): Sets the Amazon Bucket.
- ROOT (Optional): Uses a filesystem path, is used for storage space.
- URL (Optional): Allows to specify URL to host on, this is usually not needed. 
- USE_DOCUMENT_DB (Optional): Enables documentDB, this is experimental.
- DOCUMENT_DB_BUNDLE (Optional): Enables SSL with documentDB.
- BLOCK_CREATE_ACCOUNT (Optional): Blocks the ability to create accounts.

Client Enviroment Variables

- REMOTE_URL (Required): Sets the Remote URL for the client.
- DISABLE_STORAGE (Optional): Disables storage, use this if you're not using ROOT on the server.

### Wiki

For a more detailed list of myDrive features, including examples with images, visit the wiki here: https://github.com/subnub/myDrive/wiki

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
- Search For Files/Folders
- Mobile Friendly (Including Uploading!)
- Advanced Filter Options

## Installation

Required:
- Node.js (13.9+ Is Recommended)
- MongoDB

Windows users will usually need both the microsoft visual build tools, and python 2. These are required to build the sharp module.
- Visual Tools: http://go.microsoft.com/fwlink/?LinkId=691126
- Python 2: https://www.python.org/downloads/release/python-2717/

Optional:
- FFMPEG (For Video Transcoding, Does not work very well because of encryption ATM, But non-transcoded video streams work much better, I do not recommend using transcoding yet.)

Setup:
- “npm install”, Installs all dependencies. 

- "npm run init", Asks user for some environment variable details, pressing enter on these fields will instead use the default values. 

- "npm run build" or "npm run build:no-ssl", This will look for the HTTPS Certificate, Place this HTTPS certificate at the root of the project, with the naming convention (certificate.ca-bundle, certificate.crt, and certificate.key). 
Note: If you do not have or want to use a HTTPS certificate, run "npm run build:no-ssl". This will run the server in production mode, without SSL encryption, this is vulnerable to man in the middle attacks!

- “npm run create-indexes-database”, This will create indexes for mongoDB, this is greatly recommended, it will improve mongoDBs speed in retrieving files. 

- "npm start" or "npm run start:no-ssl". If you do not want SSL Encryption use "npm run start:no-ssl".

- It will then ask for an encryption key, this can be whatever you would like, this key is later hashed. Do not lose this key, there is NO way to recover data from a lost key!

- That's It! Now just Create a new account.

## Enviroment Variables

The npm run init command will create the needed env variables, but if you would like to create them manually, structure the files like so.

Backend variables: Stored in /config/prod.env

- MONGODB_URL=
- PASSWORD=
- HTTP_PORT=
- HTTPS_PORT=
- URL=
- FULL_URL=
- ROOT=

Optional:
- KEY=

The KEY variable is optional, without it the server will prompt you for a password on startup, with a KEY the server will skip prompting for the password, use a KEY if you want to use myDrive with docker, or similar tools.

Frontend variables: Stored on the root of the project .env.production 

- PORT=
- REMOTE_URL=

## Built In Server Tools

MyDrive comes with some built in NPM scripts for server management, this includes:
- Backup Database: Command “npm run backup-database", creates a temporary backup of the database inside of mongoDB, please note you can only have one backup at a time, for better backups use mongoExport. 

- Restore Database: Command “npm run restore-database”, Restores Database from backup. 

- Clean Database: Command “npm run clean-database”, Cleans database, removing any orphaned chunks that do not have a file associated with them, this command will automatically run backup database, incase anything fails. 

- Change Encryption Password: Command “change-password-database”, Changed the encryption password, that the server first asks for on start up, this requires the old encryption password. This will also create a new backup, incase anything fails.

- Delete Database: Command “npm run delete-database”, Deletes the main database, does not delete the temporary backup.

- Delete Temp Database: Command “npm run delete-temp-database”, Deletes the database backup. 

- Create Indexes: Command “npm run create-indexes-database", Creates Indexes for mongoDB, without this mongoDB will need to search through every single file on request, run this before using the server. 

- Run Tests: Command "npm run test", Starts unit testing.

## Video
I created a short YouTube video, showing off myDrives design and features: https://youtu.be/0YKU5CZHG4I

## Security 
MyDrive encrypts all file chunks, tokens, and temp tokens. These items are first encrypted with a randomly generated 32 byte private key, and random 16 byte public key (A different random public key is used for different items).The private key is encrypted with the users salted password, and then the hashed server key (Acquired on server startup). Note: Running the command to change the servers key, will generate new private and public keys for each user, and will have to re-encrypt all chunks. 

### Using myDrive for personal use?
After you create your account, disable the ability to create a new account by adding the following value to the prod.env file (Located inside on the config folder).
BLOCK_CREATE_ACCOUNT=true

## Questions? Feature Requests? Hiring? Contact Me!
Contact Email: kyle.hoell@gmail.com

## Follow my twitter account 
Twitter: https://twitter.com/subnub2



