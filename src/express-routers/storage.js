const express = require("express");
const router = new express.Router;
const auth = require("../middleware/auth");
const StorageController = require("../controllers/storage");
const storageController = new StorageController();

router.get("/storage-service/info", auth, storageController.getStorageInfo);

module.exports = router;