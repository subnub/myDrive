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
- FFMPEG (For Video Transcoding, Does not work very well because of encrytion ATM, But non-transcoded videos stream without any issue, I do not recommend using this yet.)

Setup:
- "npm run init", Asks user for some enviroment variable details, pressing enter on these fields will instead use the default values. 
- "npm run build", This will look for the HTTPS Certificate, Place this HTTPS certificate at the root of the project, with the naming convention (certificate.ca-bundle, certificate.crt, and certificate.key). 
Note: If you do not have or want to use a HTTPS certificate, run "npm run build:no--ssl". This will run the server in production mode, without SSL encryption, this is vunerabile to man in the middle attacks!
- "npm start" or "npm run start:no-ssl" If you do not want SSL Encrytion.
- It will then asks for an encrytion key, this can be whatever you would like, this key is later hashed. Do not lose this key, there is NO way to recover data from a lost key!
- That's It! Now just Create a new account.