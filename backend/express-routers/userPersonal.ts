import { Router } from "express";
import auth from "../middleware/auth";
import UserPersonalController from "../controllers/userPersonal";
import authFullUser from "../middleware/authFullUser";

const userPersonalController = new UserPersonalController();

const router = Router();

router.get("/user-service/download-personal-file-list", auth, userPersonalController.downloadPersonalFileList);

router.post("/user-service/upload-personal-file-list", auth, userPersonalController.uploadPersonalFileList);

router.post("/user-service/add-s3-storage", authFullUser, userPersonalController.addS3Storage);

router.delete("/user-service/remove-s3-storage", authFullUser, userPersonalController.removeS3Storage);

router.delete("/user-service/remove-s3-metadata", auth, userPersonalController.removeS3Metadata);

export default router;
