import { Router } from "express";
import auth from "../middleware/auth";
import authNoEmailVerification from "../middleware/authNoEmailVerificication"
import UserController from "../controllers/user";
import authRefresh from "../middleware/authRefresh";
import authLogout from "../middleware/authLogout";

const userController = new UserController();

const router = Router();

router.get("/user-service/user", authNoEmailVerification, userController.getUser);

router.patch("/user-service/refresh-storage-size", auth, userController.refreshStorageSize);

router.get("/user-service/user-detailed", auth, userController.getUserDetailed);

router.post("/user-service/login", userController.login);

router.post("/user-service/logout", authLogout, userController.logout);

router.post("/user-service/logout-all", authLogout, userController.logoutAll);

router.post("/user-service/create", userController.createUser);

router.post("/user-service/change-password", auth, userController.changePassword);

router.post("/user-service/verify-email", userController.verifyEmail);

router.post("/user-service/resend-verify-email", authNoEmailVerification, userController.resendVerifyEmail);

router.post("/user-service/send-password-reset", userController.sendPasswordReset);

router.post("/user-service/reset-password", userController.resetPassword);

router.patch("/user-service/add-name", auth, userController.addName);

router.post("/user-service/get-token", authRefresh, userController.getToken);

export default router;