import { Router } from "express";
import auth from "../middleware/auth";
import FileController from "../controllers/file-controller";
import authFullUser from "../middleware/authFullUser";
import authStreamVideo from "../middleware/authStreamVideo";
import {
  getFileInfoValidationRules,
  getListValidationRules,
  getPublicDownloadValidationRules,
  getQuickListValidationRules,
  getSuggestedListValidationRules,
  getThumbnailValidationRules,
  moveFileValidationRules,
  renameFileValidationRules,
  restoreFileValidationRules,
  trashFileValidationRules,
  trashMultiValidationRules,
} from "../middleware/files/files-middleware";

const fileController = new FileController();

const router = Router();

router.post("/file-service/upload", authFullUser, fileController.uploadFile);

router.get(
  "/file-service/thumbnail/:id",
  authFullUser,
  getThumbnailValidationRules,
  fileController.getThumbnail
);

router.get(
  "/file-service/full-thumbnail/:id",
  authFullUser,
  getThumbnailValidationRules,
  fileController.getFullThumbnail
);

router.get(
  "/file-service/public/download/:id/:tempToken",
  getPublicDownloadValidationRules,
  fileController.getPublicDownload
);

router.get(
  "/file-service/public/info/:id/:tempToken",
  getPublicDownloadValidationRules,
  fileController.getPublicInfo
);

router.get(
  "/file-service/info/:id",
  auth,
  getFileInfoValidationRules,
  fileController.getFileInfo
);

router.get(
  "/file-service/quick-list",
  auth,
  getQuickListValidationRules,
  fileController.getQuickList
);

router.get(
  "/file-service/list",
  auth,
  getListValidationRules,
  fileController.getList
);

router.get(
  "/file-service/download/access-token-stream-video",
  authFullUser,
  fileController.getAccessTokenStreamVideo
);

router.get(
  "/file-service/stream-video/:id",
  authStreamVideo,
  fileController.streamVideo
);

router.delete(
  "/file-service/remove-stream-video-token",
  authStreamVideo,
  fileController.removeStreamVideoAccessToken
);

router.get(
  "/file-service/download/:id",
  authFullUser,
  fileController.downloadFile
);

router.get(
  "/file-service/suggested-list",
  auth,
  getSuggestedListValidationRules,
  fileController.getSuggestedList
);

router.patch(
  "/file-service/make-public/:id",
  authFullUser,
  fileController.makePublic
);

router.patch(
  "/file-service/make-one/:id",
  auth,
  fileController.makeOneTimePublic
);

router.patch(
  "/file-service/rename",
  auth,
  renameFileValidationRules,
  fileController.renameFile
);

router.patch(
  "/file-service/move",
  auth,
  moveFileValidationRules,
  fileController.moveFile
);

router.patch(
  "/file-service/trash",
  auth,
  trashFileValidationRules,
  fileController.trashFile
);

router.patch(
  "/file-service/trash-multi",
  auth,
  trashMultiValidationRules,
  fileController.trashMulti
);

router.patch(
  "/file-service/restore",
  auth,
  restoreFileValidationRules,
  fileController.restoreFile
);

router.patch("/file-service/restore-multi", auth, fileController.restoreMulti);

router.patch("/file-service/remove-link/:id", auth, fileController.removeLink);

router.delete(
  "/file-service/remove/token-video/:id",
  auth,
  fileController.removeTempToken
);

router.delete("/file-service/remove", auth, fileController.deleteFile);

router.delete("/file-service/remove-multi", auth, fileController.deleteMulti);

router.post(
  "/file-service/send-share-email",
  auth,
  fileController.sendEmailShare
);

export default router;
