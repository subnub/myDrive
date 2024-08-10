import env from "../enviroment/env";
import UserService from "../services/user-service/user-service";
import { Request, Response } from "express";
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

  getUser = async (req: RequestType, res: Response) => {
    try {
      const user = req.user!;

      res.send(user);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nGet User Route Error:", e.message);
      }

      res.status(500).send("Server error getting user info");
    }
  };

  login = async (req: RequestType, res: Response) => {
    try {
      const body = req.body;

      const currentUUID = req.headers.uuid as string;

      const { user, accessToken, refreshToken } = await UserProvider.login(
        body,
        currentUUID
      );

      createLoginCookie(res, accessToken, refreshToken);

      res.status(200).send({ user });
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nLogin User Route Error:", e.message);
      }

      res.status(500).send("Server error attempting to login");
    }
  };

  getToken = async (req: RequestTypeRefresh, res: Response) => {
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
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nGet Refresh Token User Route Error:", e.message);
      }

      res.status(500).send("");
    }
  };

  logout = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const refreshToken = req.cookies["refresh-token"];

      await UserProvider.logout(userID, refreshToken);

      createLogoutCookie(res);

      res.send();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nLogout User Route Error:", e.message);
      }
      createLogoutCookie(res);
      res.status(500).send("Server error attempting to logout");
    }
  };

  logoutAll = async (req: RequestType, res: Response) => {
    if (!req.user) return;

    try {
      const userID = req.user._id;

      await UserProvider.logoutAll(userID);

      createLogoutCookie(res);

      res.send();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nLogout All User Route Error:", e.message);
      }

      res.status(500).send("Server error attempting to logout all");
    }
  };

  createUser = async (req: RequestType, res: Response) => {
    if (env.createAcctBlocked) {
      res.status(401).send();
      return;
    }

    try {
      const currentUUID = req.headers.uuid as string;

      const { user, accessToken, refreshToken, emailSent } =
        await UserProvider.create(req.body, currentUUID);

      createLoginCookie(res, accessToken, refreshToken);

      res.status(201).send({ user, emailSent });
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nCreate User Route Error:", e.message);
      }

      res.status(500).send("Server error creating user");
    }
  };

  changePassword = async (req: RequestType, res: Response) => {
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
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nChange Password User Route Error:", e.message);
      }

      res.status(500).send("Server error changing password");
    }
  };

  refreshStorageSize = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;

      await UserProvider.refreshStorageSize(userID);

      res.send();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nRefresh Storage Size User Route Error:", e.message);
      }

      res.status(500).send("Server error refreshing storage size");
    }
  };

  getUserDetailed = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;

      const userDetailed = await UserProvider.getUserDetailed(userID);

      res.send(userDetailed);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nGet User Detailed User Route Error:", e.message);
      }

      res.status(500).send("Server error getting full user info");
    }
  };

  verifyEmail = async (req: RequestType, res: Response) => {
    try {
      const verifyToken = req.body.emailToken;

      const currentUUID = req.headers.uuid as string;

      const user = await UserProvider.verifyEmail(verifyToken);

      const { accessToken, refreshToken } = await user.generateAuthToken(
        currentUUID
      );

      createLoginCookie(res, accessToken, refreshToken);

      res.send();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nVerify Email User Route Error:", e.message);
      }

      res.status(500).send("Server error verifying email");
    }
  };

  resendVerifyEmail = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;

      await UserProvider.resendVerifyEmail(userID);

      res.send();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nResend Email User Route Error:", e.message);
      }

      res.status(500).send("Server error resending verify email");
    }
  };

  sendPasswordReset = async (req: RequestType, res: Response) => {
    try {
      const email = req.body.email;

      await UserProvider.sendPasswordReset(email);

      res.send();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nSend Password Reset Email User Route Error:", e.message);
      }

      res.status(500).send("Server error sending password reset");
    }
  };

  resetPassword = async (req: RequestType, res: Response) => {
    try {
      const verifyToken = req.body.passwordToken;
      const newPassword = req.body.password;

      await UserProvider.resetPassword(newPassword, verifyToken);

      res.send();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nReset Password User Route Error:", e.message);
      }

      res.status(500).send("Server error resetting password");
    }
  };

  addName = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const name = req.body.name;

      await UserProvider.addName(userID, name);

      res.send();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nAdd Name User Route Error:", e.message);
      }

      res.status(500).send("Server error adding name");
    }
  };
}

export default UserController;
