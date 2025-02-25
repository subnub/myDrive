import { Router } from "express";
import auth from "../middleware/auth";
import FolderController from "../controllers/folder-controller";
import {
  createFolderValidationRules,
  deleteFolderValidationRules,
  downloadZipValidationRules,
  getFolderInfoValidationRules,
  getFolderListValidationRules,
  moveFolderListValidationRules,
  moveFolderValidationRules,
  renameFolderValidationRules,
  restoreFolderValidationRules,
  trashFolderValidationRules,
} from "../middleware/folders/folder-middleware";
import authFullUser from "../middleware/authFullUser";

const folderController = new FolderController();
const router = Router();

// GET

router.get(
  "/folder-service/info/:id",
  auth,
  getFolderInfoValidationRules,
  folderController.getInfo
);

router.get(
  "/folder-service/list",
  auth,
  getFolderListValidationRules,
  folderController.getFolderList
);

router.get(
  "/folder-service/move-folder-list",
  auth,
  moveFolderListValidationRules,
  folderController.getMoveFolderList
);

router.get(
  "/folder-service/download-zip",
  auth,
  downloadZipValidationRules,
  folderController.downloadZip
);

// PATCH

router.patch(
  "/folder-service/rename",
  auth,
  renameFolderValidationRules,
  folderController.renameFolder
);

router.patch(
  "/folder-service/move",
  auth,
  moveFolderValidationRules,
  folderController.moveFolder
);

router.patch(
  "/folder-service/trash",
  auth,
  trashFolderValidationRules,
  folderController.trashFolder
);

router.patch(
  "/folder-service/restore",
  auth,
  restoreFolderValidationRules,
  folderController.restoreFolder
);

// DELETE

router.delete(
  "/folder-service/remove",
  auth,
  deleteFolderValidationRules,
  folderController.deleteFolder
);

router.delete("/folder-service/remove-all", auth, folderController.deleteAll);

// POST

router.post(
  "/folder-service/create",
  auth,
  createFolderValidationRules,
  folderController.createFolder
);

router.post(
  "/folder-service/upload",
  authFullUser,
  folderController.uploadFolder
);

export default router;
