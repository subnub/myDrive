import User, { UserInterface } from "../../models/user-model";
import bcrypt from "bcryptjs";
import NotFoundError from "../../utils/NotFoundError";
import InternalServerError from "../../utils/InternalServerError";
import sendEmailVerification from "../../utils/sendVerificationEmail";
import File from "../../models/file-model";
import env from "../../enviroment/env";
import jwt from "jsonwebtoken";
import sendVerificationEmail from "../../utils/sendVerificationEmail";
import sendPasswordResetEmail from "../../utils/sendPasswordResetEmail";
import ForbiddenError from "../../utils/ForbiddenError";
import ConflictError from "../../utils/ConflictError";
import NotAuthorizedError from "../../utils/NotAuthorizedError";

type UserDataType = {
  email: string;
  password: string;
};

type jwtType = {
  iv: Buffer;
  _id: string;
};

const uknownUserType = User as unknown;

const UserStaticType = uknownUserType as {
  findByCreds: (email: string, password: string) => Promise<UserInterface>;
};

class UserService {
  constructor() {}

  login = async (userData: UserDataType, uuid: string | undefined) => {
    const email = userData.email;
    const password = userData.password;

    const user = await UserStaticType.findByCreds(email, password);

    if (!user) throw new NotFoundError("Cannot Find User");

    const { accessToken, refreshToken } = await user.generateAuthToken(uuid);

    if (!accessToken || !refreshToken)
      throw new NotFoundError("Login User Not Found Error");

    return { user, accessToken, refreshToken };
  };

  logout = async (userID: string, refreshToken: string) => {
    const user = await User.findById(userID);

    if (!user) throw new NotFoundError("Could Not Find User");

    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, env.passwordRefresh!) as jwtType;
      const encrpytionKey = user.getEncryptionKey();
      const encryptedToken = user.encryptToken(
        refreshToken,
        encrpytionKey,
        decoded.iv
      );

      for (let i = 0; i < user.tokens.length; i++) {
        const currentEncryptedToken = user.tokens[i].token;

        if (currentEncryptedToken === encryptedToken) {
          user.tokens.splice(i, 1);
          await user.save();
          break;
        }
      }
    }

    await user.save();
  };

  logoutAll = async (userID: string) => {
    const user = await User.findById(userID);

    if (!user) throw new NotFoundError("Could Not Find User");

    user.tokens = [];
    user.tempTokens = [];

    await user.save();
  };

  create = async (userData: any, uuid: string | undefined) => {
    if (env.createAcctBlocked) {
      throw new ForbiddenError("Account Creation Blocked");
    }

    const userExistsLookedUp = await User.findOne({ email: userData.email });

    if (userExistsLookedUp) {
      throw new ConflictError("Email Already Exists");
    }

    const user = new User({
      email: userData.email,
      password: userData.password,
    });
    await user.save();

    if (!user) throw new NotFoundError("User Not Found");

    await user.generateEncryptionKeys();

    const { accessToken, refreshToken } = await user.generateAuthToken(uuid);

    let emailSent = false;

    if (env.emailVerification === "true") {
      const emailToken = await user.generateEmailVerifyToken();

      emailSent = await sendEmailVerification(user, emailToken);
    }

    if (!accessToken || !refreshToken)
      throw new InternalServerError("Could Not Create New User Error");

    return { user, accessToken, refreshToken, emailSent };
  };

  changePassword = async (
    userID: string,
    oldPassword: string,
    newPassword: string,
    oldRefreshToken: string,
    uuid: string | undefined
  ) => {
    const user = await User.findById(userID);

    if (!user) throw new NotAuthorizedError("User information is incorrect");

    const date = new Date();

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) throw new NotAuthorizedError("User information is incorrect");

    const encryptionKey = user.getEncryptionKey();

    user.password = newPassword;

    user.tokens = [];
    user.tempTokens = [];
    user.passwordLastModified = date.getTime();

    await user.save();
    await user.changeEncryptionKey(encryptionKey!);

    const { accessToken, refreshToken } = await user.generateAuthToken(uuid);

    return { accessToken, refreshToken };
  };

  getUserDetailed = async (userID: string) => {
    const user = await User.findById(userID);

    if (!user) throw new NotFoundError("Cannot find user");

    return user;
  };

  verifyEmail = async (verifyToken: any) => {
    const decoded: any = jwt.verify(verifyToken!, env.passwordAccess!);

    const iv = decoded.iv;

    const user = (await User.findOne({ _id: decoded._id })) as UserInterface;
    const encrpytionKey = user.getEncryptionKey();
    const encryptedToken = user.encryptToken(verifyToken, encrpytionKey, iv);

    if (encryptedToken === user.emailToken) {
      user.emailVerified = true;
      await user.save();
      return user;
    } else {
      throw new ForbiddenError("Email Token Verification Failed");
    }
  };

  resendVerifyEmail = async (userID: string) => {
    const user = await User.findById(userID);

    if (!user) throw new NotFoundError("Cannot find user");

    const verifiedEmail = user.emailVerified;

    if (env.emailVerification !== "true") {
      throw new ForbiddenError("Email Verification Disabled");
    }

    if (!verifiedEmail) {
      const emailToken = await user.generateEmailVerifyToken();
      const result = await sendVerificationEmail(user, emailToken);
      if (!result) throw new InternalServerError("Email Verification Error");
    } else {
      throw new ForbiddenError("Email Already Authorized");
    }
  };

  sendPasswordReset = async (email: string) => {
    if (env.emailVerification !== "true") {
      throw new ForbiddenError("Email Verification Not Enabled");
    }

    const user = await User.findOne({ email });

    if (!user) throw new NotFoundError("User Not Found Password Reset Email");

    const passwordResetToken = await user.generatePasswordResetToken();

    await sendPasswordResetEmail(user, passwordResetToken!);
  };

  resetPassword = async (newPassword: string, verifyToken: any) => {
    const decoded: any = jwt.verify(verifyToken!, env.passwordAccess!);

    const iv = decoded.iv;

    const user = (await User.findOne({ _id: decoded._id })) as UserInterface;
    const encrpytionKey = user.getEncryptionKey();
    const encryptedToken = user.encryptToken(verifyToken, encrpytionKey, iv);

    if (encryptedToken === user.passwordResetToken) {
      const encryptionKey = user.getEncryptionKey();

      user.password = newPassword;

      user.tokens = [];
      user.tempTokens = [];
      user.passwordResetToken = undefined;

      await user.save();
      await user.changeEncryptionKey(encryptionKey!);
    } else {
      throw new ForbiddenError("Reset Password Token Do Not Match");
    }
  };
}

export default UserService;
