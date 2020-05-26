import {Router} from "express";
import auth from "../middleware/auth";
import tempAuth from "../middleware/tempAuth";
import tempAuthVideo from "../middleware/tempAuthVideo";
import FileController from "../controllers/file";
import env from "../enviroment/env";
import MongoService from "../services/ChunkService/MongoService";
import FileSystemService from "../services/ChunkService/FileSystemService";
import S3Service from "../services/ChunkService/S3Service";

let fileController: FileController;

if (env.dbType === "mongo") {

    const mongoService = new MongoService();
    fileController = new FileController(mongoService);

} else if (env.dbType === "fs") {

    const fileSystemService = new FileSystemService();
    fileController = new FileController(fileSystemService);

} else {

    const s3Service = new S3Service();
    fileController = new FileController(s3Service);
}

const router = Router();

router.post("/file-service/upload", auth, fileController.uploadFile);

router.get("/file-service/thumbnail/:id", auth, fileController.getThumbnail);

router.get("/file-service/full-thumbnail/:id", auth, fileController.getFullThumbnail);

router.get("/file-service/public/download/:id/:tempToken", fileController.getPublicDownload);

router.get("/file-service/public/info/:id/:tempToken", fileController.getPublicInfo);

router.get("/file-service/info/:id", auth, fileController.getFileInfo);

router.get("/file-service/quick-list", auth, fileController.getQuickList);

router.get("/file-service/list", auth, fileController.getList);

router.get("/file-service/download/get-token", auth, fileController.getDownloadToken);

router.get("/file-service/download/get-token-video", auth, fileController.getDownloadTokenVideo);

router.get("/file-service/stream-video/:id/:tempToken/:uuid", tempAuthVideo, fileController.streamVideo);

router.get("/file-service/download/:id/:tempToken", tempAuth, fileController.downloadFile);

router.get("/file-service/suggested-list", auth, fileController.getSuggestedList);

router.patch("/file-service/make-public/:id", auth, fileController.makePublic);

router.patch("/file-service/make-one/:id", auth, fileController.makeOneTimePublic);

router.patch("/file-service/rename", auth, fileController.renameFile);

router.patch("/file-service/move", auth, fileController.moveFile);

router.delete("/file-service/remove-link/:id", auth, fileController.removeLink);

router.delete("/file-service/remove/token-video/:tempToken/:uuid", auth, fileController.removeTempToken);

router.delete("/file-service/remove", auth, fileController.deleteFile);

export default router;