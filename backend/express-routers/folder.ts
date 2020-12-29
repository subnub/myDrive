import {Router} from "express";
import auth from "../middleware/auth";
import env from "../enviroment/env";
import MongoService from "../services/ChunkService/MongoService";
import FileSystemService from "../services/ChunkService/FileSystemService";
import S3Service from "../services/ChunkService/S3Service";
import FolderController from "../controllers/folder";

let folderController: FolderController;

if (env.dbType === "mongo") {

    const mongoService = new MongoService();
    folderController = new FolderController(mongoService);

} else if (env.dbType === "fs") {

    const fileSystemService = new FileSystemService();
    folderController = new FolderController(fileSystemService);

} else {

    const s3Service = new S3Service();
    folderController = new FolderController(s3Service);
}

const router = Router();

router.post("/folder-service/upload", auth, folderController.uploadFolder);

router.delete("/folder-service/remove", auth, folderController.deleteFolder);

router.delete("/folder-service/remove-all", auth, folderController.deleteAll);

router.get("/folder-service/info/:id", auth, folderController.getInfo);

router.get("/folder-service/subfolder-list", auth, folderController.getSubfolderList);

router.get("/folder-service/list", auth, folderController.getFolderList);

router.patch("/folder-service/rename", auth, folderController.renameFolder);

router.patch("/folder-service/move", auth, folderController.moveFolder);

router.get("/folder-service/subfolder-list-full", auth, folderController.getSubfolderFullList);

// Personal Folder

router.delete("/folder-service-personal/remove", auth, folderController.deletePersonalFolder);

export default router;