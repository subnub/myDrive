import { Router } from "express";
import auth from "../middleware/auth";
import UserController from "../controllers/user";

const userController = new UserController();

const router = Router();

router.get("/user-service/user", auth, userController.getUser);

router.post("/user-service/login", userController.login);

router.post("/user-service/logout", auth, userController.logout);

router.post("/user-service/logout-all", auth, userController.logoutAll);

router.post("/user-service/create", userController.createUser);

router.post("/user-service/change-password", auth, userController.changePassword);

export default router;