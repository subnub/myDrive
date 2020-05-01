import {Router} from "express";
import auth from "../middleware/auth";
import StorageController from "../controllers/storage";

const storageController = new StorageController();

const router = Router();

router.get("/storage-service/info", auth, storageController.getStorageInfo);

export default router;