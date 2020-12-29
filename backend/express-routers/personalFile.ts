import {Router} from "express";
import auth from "../middleware/auth";
import PersonalFileController from "../controllers/personalFile";
import authFullUser from "../middleware/authFullUser";
import authStreamVideo from "../middleware/authStreamVideo";

const personalFileController = new PersonalFileController();

const router = Router();

router.post("/file-service-personal/upload", authFullUser, personalFileController.uploadPersonalFile);

router.get("/file-service-personal/download/:id", authFullUser, personalFileController.downloadPersonalFile);

router.get("/file-service-personal/thumbnail/:id", authFullUser, personalFileController.getPersonalThumbnail);

router.get("/file-service-personal/full-thumbnail/:id", authFullUser, personalFileController.getFullPersonalThumbnail);

router.get("/file-service-personal/stream-video/:id", authStreamVideo, personalFileController.streamPersonalVideo);

router.get("/file-service-personal/public/download/:id/:tempToken", personalFileController.getPublicPersonalDownload);

router.delete("/file-service-personal/remove", auth, personalFileController.deletePersonalFile);


export default router;