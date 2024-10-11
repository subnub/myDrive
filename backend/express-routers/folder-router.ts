import { Router } from "express";
import auth from "../middleware/auth";
import FolderController from "../controllers/folder-controller";
import {
  getFolderInfoValidationRules,
  moveFolderListValidationRules,
} from "../middleware/folders/folder-middleware";

const folderController = new FolderController();
const router = Router();

// GET

router.get(
  "/folder-service/info/:id",
  auth,
  getFolderInfoValidationRules,
  folderController.getInfo
);

router.get("/folder-service/list", auth, folderController.getFolderList);

router.get(
  "/folder-service/move-folder-list",
  auth,
  moveFolderListValidationRules,
  folderController.getMoveFolderList
);

// PATCH

router.patch("/folder-service/rename", auth, folderController.renameFolder);

router.patch("/folder-service/move", auth, folderController.moveFolder);

router.patch("/folder-service/trash", auth, folderController.trashFolder);

router.patch("/folder-service/restore", auth, folderController.restoreFolder);

// DELETE

router.delete("/folder-service/remove", auth, folderController.deleteFolder);

router.delete("/folder-service/remove-all", auth, folderController.deleteAll);

// POST

router.post("/folder-service/create", auth, folderController.createFolder);

export default router;
