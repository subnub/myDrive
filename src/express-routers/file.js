const express = require("express");
const router = new express.Router;
const auth = require("../middleware/auth");
const tempAuth = require("../middleware/tempAuth")
const tempAuthVideo = require("../middleware/tempAuthVideo")
const FileController = require("../controllers/file");

const fileController = new FileController()

router.post("/file-service/upload", auth, fileController.uploadFile);

router.post("/file-service/transcode-video", auth, fileController.transcodeVideo);

router.get("/file-service/thumbnail/:id", auth, fileController.getThumbnail);

router.get("/file-service/full-thumbnail/:id", auth, fileController.getFullThumbnail);

router.get("/file-service/public/download/:id/:tempToken", fileController.getPublicDownload);

router.get("/file-service/public/info/:id/:tempToken", fileController.getPublicInfo);

router.get("/file-service/info/:id", auth, fileController.getFileInfo);

router.get("/file-service/quick-list", auth, fileController.getQuickList);

router.get("/file-service/list", auth, fileController.getList);

router.get("/file-service/download/get-token", auth, fileController.getDownloadToken);

router.get("/file-service/download/get-token-video", auth, fileController.getDownloadTokenVideo);

router.get("/file-service/stream-video-transcoded/:id/:tempToken/:uuid", tempAuthVideo, fileController.streamTranscodedVideo);

router.get("/file-service/stream-video/:id/:tempToken/:uuid", tempAuthVideo, fileController.streamVideo);

router.get("/file-service/download/:id/:tempToken", tempAuth, fileController.downloadFile);

router.get("/file-service/suggested-list", auth, fileController.getSuggestedList);

router.patch("/file-service/make-public/:id", auth, fileController.makePublic);

router.patch("/file-service/make-one/:id", auth, fileController.makeOneTimePublic);

router.patch("/file-service/rename", auth, fileController.renameFile);

router.patch("/file-service/move", auth, fileController.moveFile);

router.delete("/file-service/remove-link/:id", auth, fileController.removeLink);

router.delete("/file-service/remove/token-video/:tempToken", auth, fileController.removeTempToken);

router.delete("/file-service/transcode-video/remove", auth, fileController.removeTranscodeVideo);

router.delete("/file-service/remove", auth, fileController.deleteFile);

module.exports = router;