const express = require("express");
const router = new express.Router;
const auth = require("../middleware/auth");
const FolderController = require("../controllers/folder");
const folderController = new FolderController();

router.post("/folder-service/upload", auth, folderController.uploadFolder);

router.delete("/folder-service/remove", auth, folderController.deleteFolder);

router.delete("/folder-service/remove-all", auth, folderController.deleteAll);

router.get("/folder-service/info/:id", auth, folderController.getInfo);

router.get("/folder-service/subfolder-list", auth, folderController.getSubfolderList);

router.get("/folder-service/list", auth, folderController.getFolderList);

router.patch("/folder-service/rename", auth, folderController.renameFolder);

router.patch("/folder-service/move", auth, folderController.moveFolder);

module.exports = router;