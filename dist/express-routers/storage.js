"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
const auth = require("../middleware/auth");
const StorageController = require("../controllers/storage");
const storageController = new StorageController();
router.get("/storage-service/info", auth, storageController.getStorageInfo);
module.exports = router;
