import { Router } from "express";
import UserGoogleController from "../controllers/userGoogle";
import authFullUser from "../middleware/authFullUser";

const userGoogleController = new UserGoogleController();

const router = Router();

router.post("/user-service/create-google-storage-url", authFullUser, userGoogleController.createGoogleStorageURL);

router.post("/user-service/add-google-storage", authFullUser, userGoogleController.addGoogleStorage);

router.delete("/user-service/remove-google-storage", authFullUser, userGoogleController.removeGoogleStorage);

export default router;