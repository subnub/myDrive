# ![MyDrive Homepage](github_images/homepage.png)

# ☁️ MyDrive

MyDrive is an Open Source cloud file storage server (Similar To Google Drive). Host myDrive on your own server or trusted platform and then access myDrive through your web browser. MyDrive uses mongoDB to store file/folder metadata, and supports multiple databases to store the file chunks, such as Amazon S3, or the Filesystem.

[Main myDrive website](https://mydrive-storage.com/)

## 🔍 Index

- [Features](#features)
- [Tech stack](#tech-stack)
- [Installation (non docker)](#installation)
- [Docker](#docker)
- [Screenshots](#screenshots)
- [Video](#video)
- [Live demo](#live-demo)
- [Feature requests/bug reports](#bugs)
- [Updating from a previous version of myDrive](#updating)

<span id="features"></span>

## ⭐️ Features

- Upload Files
- Download Files
- Upload Folders
- Download Folders (Automatically converts to zip)
- Multiple DB Support (Amazon S3, Filesystem)
- Photo, Video Viewer and Media Gallery
- Generated Photo And Video Thumbnails
- File Sharing
- PWA Support
- AES256 Encryption
- Service Worker
- Mobile Support
- Docker
- Email Verification
- JWT (Access and Refresh Tokens)

<span id="tech-stack"></span>

## 👨‍🔬 Tech Stack

- React
- Typescript
- Node.js
- Express
- MongoDB
- Vite

<span id="installation"></span>

## 💻 Installation

Required:

- Node.js (20 Recommended)
- MongoDB (Unless using a service like Atlas)
- FFMPEG (Optional, used for video thumbnails)
- build-essential package (If using linux)

<br/>

Setup (Non Docker Method):

> Install Node Modules

```javascript
npm install
```

<br>

> Create Environment Variables:

> You can find enviroment variable examples under: <br />  
> [backend/config](backend/config) -> Backend Enviroment Variables  
> [src/config](src/config) -> Frontend Enviroment Variables

> Simply remove the .example from the end of the filename, and fill in the values.

<br />

> Run the build command

```javascript
npm run build
```

<br />

> Start the server

```javascript
npm run start
```

#### Possible installation issues

Make issue

```javascript
npm error gyp ERR! stack Error: not found: make
```

This is because you do not have the build essentials installed which is required for Linux. You can install them by running the following command:

```javascript
sudo apt-get install build-essential
```

<br/>

Memory issue

```javascript
Aborted (core dumped)
```

When running the `npm run build` command it may take more memory than node allows by default. You will get the above error in such a case. To fix this, you can run the following command instead when building:

```javascript
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

You can read more about this issue [here](https://stackoverflow.com/questions/38558989/node-js-heap-out-of-memory).

<span id="docker"></span>

## 🐳 Docker

Setup:

> Create Environment Variables:

> You can find enviroment variable examples under: <br />  
> [backend/config](backend/config) -> Backend Enviroment Variables  
> [src/config](src/config) -> Frontend Enviroment Variables

> Simply remove the .example from the end of the filename, and fill in the values.

<br />

> Start the Docker image

```javascript
npm run docker:production
```

<span id="screenshots"></span>

## 📸 Screenshots

Modern and colorful design
![MyDrive Design](github_images/homepage.png)

Upload Files
![MyDrive Upload](github_images/upload.png)

Download Files
![MyDrive Upload](github_images/download.png)

Image Viewer
![Image Viewer](github_images/image-viewer.png)

Video Viewer
![Video Viewer](github_images/video-viewer.png)

Media Gallery
![Search](github_images/media-viewer.png)

Share Files
![Share](github_images/share.png)

Search For Files/Folders
![Search](github_images/search.png)

Move File/Folders
![Move](github_images/move.png)

Trash
![Trash](github_images/trash.png)

<span id="video"></span>

## 🎥 Video

I created a short YouTube video, showing off myDrives design and features: (Coming soon)

<span id="live-demo"></span>

## 🕹️ Live demo

Demo: http://143.244.181.219:3000/

Note: Creating, deleting and other features are disabled in the demo.

<span id="bugs"></span>

## 👾 Bug reports and Feature Requests

Contact Email: kyle.hoell@gmail.com

<span id="updating"></span>

## ⬆️ Updating from a previous version of myDrive

If you are upgrading from myDrive 3 there is some data migration and scripts you must run for myDrive 4 to work properly.

> Run the migration script <br />
> Note: Make sure you have env variables set

```javascript
npm run migrate-to-mydrive4
```

Also, if you are updating from myDrive 3, or if you did not have video thumbnails enabled and would like to enable them now you can do so by running the following command:<br />
Note: Make sure you have video thumbnails enabled in your env variables and FFMPEG installed.

```javascript
npm run create-video-thumbnails
```
