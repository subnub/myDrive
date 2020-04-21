import {Router} from "express";
const router = Router();
import auth from "../middleware/auth";
import StorageController from "../controllers/storage";
const storageController = new StorageController();

router.get("/storage-service/info", auth, storageController.getStorageInfo);

export default router;