import { Router } from "express";
import auth from "../middleware/auth";
import UserController from "../controllers/user-controller";
import authRefresh from "../middleware/authRefresh";
import authLogout from "../middleware/authLogout";
import {
  changePasswordValidationRules,
  createAccountValidationRules,
  loginAccountValidationRules,
} from "../middleware/user/user-middleware";

const userController = new UserController();

const router = Router();

// GET

router.get("/user-service/user", auth, userController.getUser);

router.get("/user-service/user-detailed", auth, userController.getUserDetailed);

// POST

router.post(
  "/user-service/login",
  loginAccountValidationRules,
  userController.login
);

router.post("/user-service/logout", authLogout, userController.logout);

router.post("/user-service/logout-all", authLogout, userController.logoutAll);

router.post(
  "/user-service/create",
  createAccountValidationRules,
  userController.createUser
);

router.post("/user-service/get-token", authRefresh, userController.getToken);

// PATCH

router.patch(
  "/user-service/change-password",
  auth,
  changePasswordValidationRules,
  userController.changePassword
);

router.patch(
  "/user-service/resend-verify-email",
  auth,
  userController.resendVerifyEmail
);

router.patch("/user-service/verify-email", userController.verifyEmail);

router.patch("/user-service/reset-password", userController.resetPassword);

router.patch(
  "/user-service/send-password-reset",
  userController.sendPasswordReset
);

export default router;
