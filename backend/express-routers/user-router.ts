import { Router } from "express";
import auth from "../middleware/auth";
import authNoEmailVerification from "../middleware/authNoEmailVerificication";
import UserController from "../controllers/user-controller";
import authRefresh from "../middleware/authRefresh";
import authLogout from "../middleware/authLogout";
import {
  changePasswordValidationRules,
  createAccountValidationRules,
} from "../middleware/user/user-middleware";

const userController = new UserController();

const router = Router();

// GET

router.get(
  "/user-service/user",
  authNoEmailVerification,
  userController.getUser
);

router.get("/user-service/user-detailed", auth, userController.getUserDetailed);

// POST

router.post("/user-service/login", userController.login);

router.post("/user-service/logout", authLogout, userController.logout);

router.post("/user-service/logout-all", authLogout, userController.logoutAll);

router.post(
  "/user-service/create",
  createAccountValidationRules,
  userController.createUser
);

router.post("/user-service/verify-email", userController.verifyEmail);

router.post(
  "/user-service/resend-verify-email",
  authNoEmailVerification,
  userController.resendVerifyEmail
);

router.post(
  "/user-service/send-password-reset",
  userController.sendPasswordReset
);

router.post("/user-service/reset-password", userController.resetPassword);

router.post("/user-service/get-token", authRefresh, userController.getToken);

// PATCH

router.patch(
  "/user-service/change-password",
  auth,
  changePasswordValidationRules,
  userController.changePassword
);

export default router;
