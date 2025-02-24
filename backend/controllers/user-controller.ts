import env from "../enviroment/env";
import UserService from "../services/user-service/user-service";
import { NextFunction, Request, Response } from "express";
import { UserInterface } from "../models/user-model";
import {
  createLoginCookie,
  createLogoutCookie,
} from "../cookies/create-cookies";
import NotFoundError from "../utils/NotFoundError";
import InternalServerError from "../utils/InternalServerError";

const UserProvider = new UserService();

type userAccessType = {
  _id: string;
  emailVerified: boolean;
  email: string;
  admin: boolean;
  botChecked: boolean;
  username: string;
};

interface RequestTypeRefresh extends Request {
  user?: UserInterface;
  encryptedToken?: string;
}

interface RequestType extends Request {
  user?: userAccessType;
  encryptedToken?: string;
}

class UserController {
  constructor() {}

  getUser = async (req: RequestType, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;

      res.send(user);
    } catch (e) {
      next(e);
    }
  };

  login = async (req: RequestType, res: Response, next: NextFunction) => {
    try {
      const body = req.body;

      const currentUUID = req.headers.uuid as string;

      const { user, accessToken, refreshToken } = await UserProvider.login(
        body,
        currentUUID
      );

      createLoginCookie(res, accessToken, refreshToken);

      res.status(200).send({ user });
    } catch (e) {
      next(e);
    }
  };

  getToken = async (
    req: RequestTypeRefresh,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;

      if (!user) throw new NotFoundError("User Not Found");

      const currentUUID = req.headers.uuid as string;

      const { accessToken, refreshToken } = await user.generateAuthToken(
        currentUUID
      );

      if (!accessToken || !refreshToken) {
        throw new InternalServerError("User/Access/Refresh Token Missing");
      }

      createLoginCookie(res, accessToken, refreshToken);

      res.status(201).send();
    } catch (e) {
      next(e);
    }
  };

  logout = async (req: RequestType, res: Response, next: NextFunction) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const refreshToken = req.cookies["refresh-token"];

      await UserProvider.logout(userID, refreshToken);

      createLogoutCookie(res);

      res.send();
    } catch (e) {
      createLogoutCookie(res);
      next(e);
    }
  };

  logoutAll = async (req: RequestType, res: Response, next: NextFunction) => {
    if (!req.user) return;

    try {
      const userID = req.user._id;

      await UserProvider.logoutAll(userID);

      createLogoutCookie(res);

      res.send();
    } catch (e) {
      next(e);
    }
  };

  createUser = async (req: RequestType, res: Response, next: NextFunction) => {
    try {
      const currentUUID = req.headers.uuid as string;

      const { user, accessToken, refreshToken, emailSent } =
        await UserProvider.create(req.body, currentUUID);

      createLoginCookie(res, accessToken, refreshToken);

      res.status(201).send({ user, emailSent });
    } catch (e) {
      next(e);
    }
  };

  changePassword = async (
    req: RequestType,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const oldPassword = req.body.oldPassword;
      const newPassword = req.body.newPassword;
      const oldRefreshToken = req.cookies["refresh-token"];

      const currentUUID = req.headers.uuid as string;

      const { accessToken, refreshToken } = await UserProvider.changePassword(
        userID,
        oldPassword,
        newPassword,
        oldRefreshToken,
        currentUUID
      );

      createLoginCookie(res, accessToken, refreshToken);

      res.send();
    } catch (e) {
      next(e);
    }
  };

  getUserDetailed = async (
    req: RequestType,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;

      const userDetailed = await UserProvider.getUserDetailed(userID);

      res.send(userDetailed);
    } catch (e) {
      next(e);
    }
  };

  verifyEmail = async (req: RequestType, res: Response, next: NextFunction) => {
    try {
      const verifyToken = req.body.emailToken;

      const currentUUID = req.headers.uuid as string;

      const user = await UserProvider.verifyEmail(verifyToken);

      const { accessToken, refreshToken } = await user.generateAuthToken(
        currentUUID
      );

      createLoginCookie(res, accessToken, refreshToken);

      res.send();
    } catch (e) {
      next(e);
    }
  };

  resendVerifyEmail = async (
    req: RequestType,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;

      await UserProvider.resendVerifyEmail(userID);

      res.send();
    } catch (e) {
      next(e);
    }
  };

  sendPasswordReset = async (
    req: RequestType,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const email = req.body.email;

      await UserProvider.sendPasswordReset(email);

      res.send();
    } catch (e) {
      next(e);
    }
  };

  resetPassword = async (
    req: RequestType,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const verifyToken = req.body.passwordToken;
      const newPassword = req.body.password;

      await UserProvider.resetPassword(newPassword, verifyToken);

      res.send();
    } catch (e) {
      next(e);
    }
  };
}

export default UserController;
