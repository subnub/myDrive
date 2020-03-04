const express = require("express");
const router = new express.Router;
const auth = require("../middleware/auth");
const UserController = require("../controllers/user");
const userController = new UserController();

router.get("/user-service/user", auth, userController.getUser);

router.post("/user-service/login", userController.login);

router.post("/user-service/logout", auth, userController.logout);

router.post("/user-service/logout-all", auth, userController.logoutAll);

router.post("/user-service/create", userController.createUser);

router.post("/user-service/change-password", auth, userController.changePassword);

module.exports = router;