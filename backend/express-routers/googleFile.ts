import {Router} from "express";
import auth from "../middleware/auth";
import GoogleFileController from "../controllers/googleFile";
import authFullUser from "../middleware/authFullUser";

const googleController = new GoogleFileController();

const router = Router();

router.get("/file-service-google/list", authFullUser, googleController.getList);

router.get("/file-service-google-mongo/list", authFullUser, googleController.getMongoGoogleList);

router.get("/file-service-google/info/:id", authFullUser, googleController.getFileInfo);

router.get("/file-service-google-mongo/quick-list", authFullUser, googleController.getGoogleMongoQuickList);

router.get("/file-service-google-mongo/suggested-list", authFullUser, googleController.getGoogleMongoSuggestedList);

router.patch("/file-service-google/rename", authFullUser, googleController.renameFile);

router.delete("/file-service-google/remove", authFullUser, googleController.removeFile);

router.get("/file-service-google/download/:id/:tempToken", authFullUser, googleController.downloadFile);

router.get("/file-service-google-doc/download/:id/:tempToken", authFullUser, googleController.downloadDoc);

router.get("/file-service-google/thumbnail/:id", authFullUser, googleController.getThumbnail);

router.get("/file-service-google/full-thumbnail/:id", authFullUser, googleController.getFulllThumbnail);

router.get("/file-service-google/stream-video/:id/:tempToken/:uuid", authFullUser, googleController.streamVideo);

router.post("/file-service-google/upload", authFullUser, googleController.uploadFile);

router.patch("/file-service-google/move", authFullUser, googleController.moveFile);

router.patch("/file-service-google/make-public/:id", authFullUser, googleController.makeFilePublic);

router.delete("/file-service-google/remove-link/:id", authFullUser, googleController.removePublicLink);

export default router;