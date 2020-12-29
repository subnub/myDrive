import {Router} from "express";
import auth from "../middleware/auth";
import FileController from "../controllers/file";
import env from "../enviroment/env";
import MongoService from "../services/ChunkService/MongoService";
import FileSystemService from "../services/ChunkService/FileSystemService";
import S3Service from "../services/ChunkService/S3Service";
import ChunkInterface from "../services/ChunkService/utils/ChunkInterface";
import authFullUser from "../middleware/authFullUser";
import authStreamVideo from "../middleware/authStreamVideo";

let fileController: FileController;
let chunkService: ChunkInterface;

if (env.dbType === "mongo") {

    const mongoService = new MongoService();
    chunkService = mongoService;
    fileController = new FileController(mongoService);

} else if (env.dbType === "fs") {

    const fileSystemService = new FileSystemService();
    chunkService = fileSystemService
    fileController = new FileController(fileSystemService);

} else {

    const s3Service = new S3Service();
    chunkService = s3Service;
    fileController = new FileController(s3Service);
}

const router = Router();

router.post("/file-service/upload", authFullUser, fileController.uploadFile);

router.get("/file-service/thumbnail/:id", authFullUser, fileController.getThumbnail);

router.get("/file-service/full-thumbnail/:id", authFullUser, fileController.getFullThumbnail);

router.get("/file-service/public/download/:id/:tempToken", fileController.getPublicDownload);

router.get("/file-service/public/info/:id/:tempToken", fileController.getPublicInfo);

router.get("/file-service/info/:id", auth, fileController.getFileInfo);

router.get("/file-service/quick-list", auth, fileController.getQuickList);

router.get("/file-service/list", auth, fileController.getList);

router.get("/file-service/download/access-token-stream-video", authFullUser, fileController.getAccessTokenStreamVideo)

router.get("/file-service/stream-video/:id", authStreamVideo, fileController.streamVideo);

router.delete("/file-service/remove-stream-video-token", authStreamVideo, fileController.removeStreamVideoAccessToken);

router.get("/file-service/download/:id", authFullUser, fileController.downloadFile);

router.get("/file-service/suggested-list", auth, fileController.getSuggestedList);

router.patch("/file-service/make-public/:id", authFullUser, fileController.makePublic);

router.patch("/file-service/make-one/:id", auth, fileController.makeOneTimePublic);

router.patch("/file-service/rename", auth, fileController.renameFile);

router.patch("/file-service/move", auth, fileController.moveFile);

router.delete("/file-service/remove-link/:id", auth, fileController.removeLink);

router.delete("/file-service/remove/token-video/:id", auth, fileController.removeTempToken);

router.delete("/file-service/remove", auth, fileController.deleteFile);

router.post("/file-service/send-share-email", auth, fileController.sendEmailShare);

export default router;

// NO longer needed left for reference

//router.delete("/file-service/remove/token-video/:tempToken/:uuid", auth, fileController.removeTempToken);
//router.get("/file-service/stream-video/:id/:tempToken/:uuid", auth, fileController.streamVideo);
//router.get("/file-service/stream-video/:id", auth, fileController.streamVideo);
//router.get("/file-service/download/get-token", authFullUser, fileController.getDownloadToken);
//router.get("/file-service/download/get-token-video", auth, fileController.getDownloadTokenVideo);