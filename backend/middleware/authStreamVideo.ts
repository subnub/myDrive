import jwt from "jsonwebtoken";
import User, { UserInterface } from "../models/user-model";
import env from "../enviroment/env";
import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";

interface RequestType extends Request {
  user?: UserInterface;
  token?: string;
  encryptedToken?: string;
  accessTokenStreamVideo?: string;
}

type jwtType = {
  iv: Buffer;
  _id: string;
  time: number;
};

const removeOldTokens = async (
  userID: mongoose.Types.ObjectId,
  uuid: string | undefined,
  oldTime: number
) => {
  try {
    const minusTime = oldTime - 60 * 1000 * 60 * 24;

    uuid = uuid ? uuid : "unknown";

    if (uuid === "unknown") return;

    await User.updateOne(
      { _id: userID },
      { $pull: { tempTokens: { uuid, time: { $lt: minusTime } } } }
    );
  } catch (e) {
    console.log("cannot remove old tokens", e);
  }
};

const authStreamVideo = async (
  req: RequestType,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessTokenStreamVideo = req.cookies["video-access-token"];
    const currentUUID = req.headers.uuid as string;

    if (!accessTokenStreamVideo) throw new Error("No Access Token");

    const decoded = jwt.verify(
      accessTokenStreamVideo,
      env.passwordAccess!
    ) as jwtType;

    const time = decoded.time;

    const user = await User.findById(new ObjectId(decoded._id));

    if (!user) throw new Error("No User");

    const encrpytionKey = user.getEncryptionKey();
    const encryptedToken = user.encryptToken(
      accessTokenStreamVideo,
      encrpytionKey,
      decoded.iv
    );

    let tokenFound = false;

    for (let i = 0; i < user.tempTokens.length; i++) {
      const currentEncryptedToken = user.tempTokens[i].token;

      if (currentEncryptedToken === encryptedToken) {
        tokenFound = true;
        removeOldTokens(user._id, currentUUID, time);
        break;
      }
    }

    if (!tokenFound) throw new Error("Access Token Not Found");

    req.user = user;
    req.accessTokenStreamVideo = encryptedToken;

    next();
  } catch (e) {
    if (
      e instanceof Error &&
      e.message !== "No Access Token" &&
      e.message !== "No User" &&
      e.message !== "Access Token Not Found"
    ) {
      console.log("\nAuthorization Stream Video Middleware Error:", e.message);
    }

    res.status(401).send("Error Authenticating");
  }
};

export default authStreamVideo;
