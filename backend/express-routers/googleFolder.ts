import {Router} from "express";
import GoogleFolderController from "../controllers/googleFolder";
import authFullUser from "../middleware/authFullUser";

const googleFolderController = new GoogleFolderController();

const router = Router();

router.get("/folder-service-google/list", authFullUser, googleFolderController.getList);

router.get("/folder-service-google-mongo/list", authFullUser, googleFolderController.getGoogleMongoList);

router.get("/folder-service-google/info/:id", authFullUser, googleFolderController.getInfo);

router.get("/folder-service-google/subfolder-list", authFullUser, googleFolderController.getSubFolderList);

router.get("/folder-service-google/subfolder-list-full", authFullUser, googleFolderController.getSubfolderFullList);

router.patch("/folder-service-google/rename", authFullUser, googleFolderController.renameFolder);

router.delete("/folder-service-google/remove", authFullUser,googleFolderController.removeFolder);

router.post("/folder-service-google/upload", authFullUser, googleFolderController.upload);

router.patch("/folder-service-google/move", authFullUser, googleFolderController.moveFolder);

export default router;