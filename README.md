# ![MyDrive Homepage](https://github.com/subnub/myDrive/blob/master/github_images/homepage.png?raw=true)


<div align="center">
  <a href="https://github.com/subnub/myDrive/stargazers"><img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/subnub/myDrive?label=myDrive"></a>
  <a href="https://github.com/subnub/myDrive/issues"><img alt="Issues" src="https://img.shields.io/github/issues/subnub/myDrive" /></a>
  <a href="https://github.com/subnub/myDrive/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/github/license/subnub/myDrive"></a>
  <a href="https://github.com/subnub/myDrive/graphs/contributors"><img alt="Contributors" src="https://img.shields.io/github/contributors/subnub/myDrive" /></a>
</div>

<div align="center">
  <h1>☁️ MyDrive</h1>
  <strong>Open Source cloud file storage server (Similar To Google Drive)</strong>
  <p>Host myDrive on your own server or trusted platform and then access myDrive through your web browser. MyDrive uses mongoDB to store file/folder metadata, and supports multiple databases to store the file chunks, such as Amazon S3, or the Filesystem.</p>

  <a href="https://mydrive-storage.com/">Website</a>
  <span> | </span>
  <a href="http://143.244.181.219:3000/">Live demo</a>
</div>

## 🔍 Index

- [Features](#features)
- [Tech stack](#tech-stack)
- [Running](#running)
  - [Docker](#docker)
  - [Non-Docker](#non-docker)
- [Common installation issues](#common-installation-issues)
- [Screenshots](#screenshots)
- [Video](#video)
- [Live demo](#live-demo)
- [Feature requests/bug reports](#bugs)
- [Updating from a previous version of myDrive](#updating)
- [Known issues and future improvments](#known-issues)

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
- Jest

<span id="running"></span>

## Running

<span id="docker"></span>

### 🐳 Docker

> [!IMPORTANT]
> Requirements
> - Docker
> - MongoDB (optional, comes with `docker-compose.yml`)

#### **Docker Compose**

1. Make folder for docker-compose.yml and env file.
2. Copy [`docker-compose.yml`](./docker-compose.yml) and [`.env.example`](./.env.example) to your directory.
3. Rename `.env.example` to `.env` and fill in / change the values.
4. Run the following command:

```sh
docker compose up -d
```
5. Access the app at `http://localhost:3000` 

---

#### **Docker Run**

1. Pull the image

```sh
docker pull kylehoell/mydrive:latest
```

2. Run the image

Using `.env` file. Copy the `.env.example` file and fill in the values.

```sh
docker run -d \
  -p 3000:3000 \
  --env-file ./.env \
  -v /path/example/mydrive/data/:/data/ \
  -v /path/example/mydrive/temp/:/temp/ \
  --name mydrive \
  kylehoell/mydrive:latest
```

Or directly pass in the environment variables

```sh
docker run -d \
  -p 3000:3000 \
  -e MONGODB_URL=mongodb://127.0.0.1:27017/mydrive \
  -e DB_TYPE=fs \
  -e PASSWORD_ACCESS=secretaccesspassword \
  -e PASSWORD_REFRESH=secretrefreshpassword \
  -e PASSWORD_COOKIE=secretcookiepassword \
  -e KEY=encryptionkey \
  -e VIDEO_THUMBNAILS_ENABLED=true \
  -e TEMP_VIDEO_THUMBNAIL_LIMIT=5000000000 \
  -v /path/example/mydrive/data/:/data/ \
  -v /path/example/mydrive/temp/:/temp/ \
  --name mydrive \
  kylehoell/mydrive:latest
```

3. Access the app at `http://localhost:3000`

<span id="non-docker"></span>

### 💻 Non - Docker

> [!IMPORTANT]
> Requirements
> - Node.js (20 Recommended)
> - MongoDB (Unless using a service like Atlas)
> - FFMPEG (Optional, used for video thumbnails)
> - build-essential package (If using linux)

1. Install dependencies

```sh
npm install
```

2. Create Environment Variables

You can find enviroment variable examples under: <br />  
[`backend/config`](backend/config) -> Backend Enviroment Variables  
[`src/config`](src/config) -> Frontend Enviroment Variables

Simply remove the .example from the end of the filename, and fill in the values.  
> Note: In most cases you will only have to change FE enviroment variables for development purposes.

3. Run the build command

```sh
npm run build
```

4. Start the server

```sh
npm run start
```

<span id="common-installation-issues"></span>

#### Possible installation issues

Make issue

```sh
npm error gyp ERR! stack Error: not found: make
```

This is because you do not have the build essentials installed which is required for Linux. You can install them by running the following command:

```sh
sudo apt-get install build-essential
```

Memory issue

```sh
Aborted (core dumped)
```

When running the `npm run build` command it may take more memory than node allows by default. You will get the above error in such a case. To fix this, you can run the following command instead when building:

```sh
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

You can read more about this issue [here](https://stackoverflow.com/questions/38558989/node-js-heap-out-of-memory).

<span id="docker"></span>

<span id="screenshots"></span>

## 📸 Screenshots

Modern and colorful design
![MyDrive Design](https://github.com/subnub/myDrive/blob/master/github_images/homepage.png?raw=true)

Upload Files
![MyDrive Upload](https://github.com/subnub/myDrive/blob/master/github_images/upload.png?raw=true)

Download Files
![MyDrive Upload](https://github.com/subnub/myDrive/blob/master/github_images/download.png?raw=true)

Image Viewer
![Image Viewer](https://github.com/subnub/myDrive/blob/master/github_images/image-viewer.png?raw=true)

Video Viewer
![Video Viewer](https://github.com/subnub/myDrive/blob/master/github_images/video-viewer.png?raw=true)

Media Gallery
![Search](https://github.com/subnub/myDrive/blob/master/github_images/media-viewer.png?raw=true)

Share Files
![Share](https://github.com/subnub/myDrive/blob/master/github_images/share.png?raw=true)

Search For Files/Folders
![Search](https://github.com/subnub/myDrive/blob/master/github_images/search.png?raw=true)

Move File/Folders
![Move](https://github.com/subnub/myDrive/blob/master/github_images/move.png?raw=true)

Multi-select
![Multi-select](https://github.com/subnub/myDrive/blob/master/github_images/multiselect.png?raw=true)

Custom context menu
![Context menu](https://github.com/subnub/myDrive/blob/master/github_images/context.png?raw=true)

Trash
![Trash](https://github.com/subnub/myDrive/blob/master/github_images/trash.png?raw=true)

<span id="video"></span>

## 🎥 Video

I created a short YouTube video, showing off myDrives design and features:

[![myDrive 4 (open source Google Drive alternative) - UI and feature overview
](https://github.com/subnub/myDrive/blob/master/github_images/youtube-video.jpeg?raw=true)](https://www.youtube.com/watch?v=IqmTvAFBszg "myDrive 4 (open source Google Drive alternative) - UI and feature overview
")

<span id="live-demo"></span>

## 🕹️ Live demo

[Demo](http://143.244.181.219:3000/)

Note: Creating, deleting and other features are disabled in the demo. Also the service worker is not enabled in the demo, images thumbnails are not cached because of this.

Also this is just a 512mb RAM droplet go easy on her.

<span id="bugs"></span>

## 👾 Bug reports and feature requests

Please only open issues for actual bugs, feature requests or discussions should happen in Discussions or via my email.

Contact Email: kyle.hoell@gmail.com

<span id="updating"></span>

## ⬆️ Updating from a previous version of myDrive

If you are upgrading from myDrive 3 there is some data migration and scripts you must run for myDrive 4 to work properly.

> Run the migration script <br />
> Note: Make sure you have env variables set

```sh
npm run migrate-to-mydrive4
```

Also, if you are updating from myDrive 3, or if you did not have video thumbnails enabled and would like to enable them now you can do so by running the following command:<br />
Note: Make sure you have video thumbnails enabled in your env variables and FFMPEG installed.

```sh
npm run create-video-thumbnails
```

<span id="known-issues"></span>

## 🔮 Known issues and future improvments

#### Issues

- Video streaming does not always work, especially on Safari.
- PWA downloads does not work on iOS (This may be a current iOS limitation and not a myDrive issue).
- Upload folder will sometimes fail on complex folder structures.
- Generating video thumbnails with the default method will often fail, requiring the whole file to be downloaded to temporary storage and then the thumbnail generated from that.

#### Future improvments

- OIDC Support (Top priority)
- Option to disable encryption
- File sync from a local device
- An alternative to using mongoDB
- Dark mode
- Enhance service worker, currently only caches thumbnails. This includes potentially adding offline support.
- Typescript type cleanup
- Better error handling
- Logging
- More test coverage (currently only basic backend tests)
- Some tailwind classes still need some slight tweaking
