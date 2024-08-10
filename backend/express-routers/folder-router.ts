import { Router } from "express";
import auth from "../middleware/auth";
import FolderController from "../controllers/folder-controller";
import { moveFolderListValidationRules } from "../middleware/folders/folder-middleware";

const folderController = new FolderController();
const router = Router();

router.post("/folder-service/create", auth, folderController.createFolder);

router.delete("/folder-service/remove", auth, folderController.deleteFolder);

router.delete("/folder-service/remove-all", auth, folderController.deleteAll);

router.get("/folder-service/info/:id", auth, folderController.getInfo);

router.get(
  "/folder-service/subfolder-list",
  auth,
  folderController.getSubfolderList
);

router.get("/folder-service/list", auth, folderController.getFolderList);

router.patch("/folder-service/rename", auth, folderController.renameFolder);

router.patch("/folder-service/move", auth, folderController.moveFolder);

router.patch("/folder-service/trash", auth, folderController.trashFolder);

router.patch("/folder-service/restore", auth, folderController.restoreFolder);

router.get(
  "/folder-service/subfolder-list-full",
  auth,
  folderController.getSubfolderFullList
);

router.get(
  "/folder-service/move-folder-list",
  auth,
  moveFolderListValidationRules,
  folderController.getMoveFolderList
);

export default router;
