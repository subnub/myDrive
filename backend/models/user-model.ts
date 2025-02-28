import mongoose, { Document } from "mongoose";
import validator from "validator";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import env from "../enviroment/env";
import NotAuthorizedError from "../utils/NotAuthorizedError";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      validate(value: any): any {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        } else if (value.length > 320) {
          throw new Error("Email length must be less than 320 characters");
        } else if (value.length < 3) {
          throw new Error("Email length must be at least 3 characters");
        }
      },
    },
    password: {
      type: String,
      trim: true,
      required: true,
      validate(value: any): any {
        if (value.length < 6) {
          throw new Error("Password length must be at least 6 characters");
        } else if (value.length > 256) {
          throw new Error("Password length must be less than 256 characters");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
        uuid: {
          type: String,
          required: true,
        },
        time: {
          type: Number,
          required: true,
        },
      },
    ],
    tempTokens: [
      {
        token: {
          type: String,
          required: true,
        },
        uuid: {
          type: String,
          required: true,
        },
        time: {
          type: Number,
          required: true,
        },
      },
    ],
    privateKey: {
      type: String,
    },
    publicKey: {
      type: String,
    },
    emailVerified: {
      type: Boolean,
    },
    emailToken: {
      type: String,
    },
    passwordResetToken: {
      type: String,
    },
    passwordLastModified: Number,
  },
  {
    timestamps: true,
  }
);

export interface UserInterface extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  tokens: any[];
  tempTokens: any[];
  privateKey?: string;
  publicKey?: string;
  token?: string;
  emailVerified?: boolean;
  emailToken?: string;
  passwordResetToken?: string;
  passwordLastModified?: number;

  getEncryptionKey: () => Buffer | undefined;
  generateTempAuthToken: () => Promise<any>;
  encryptToken: (tempToken: any, key: any, publicKey: any) => any;
  decryptToken: (encryptedToken: any, key: any, publicKey: any) => any;
  findByCreds: (email: string, password: string) => Promise<UserInterface>;
  generateAuthToken: (
    uuid: string | undefined
  ) => Promise<{ accessToken: string; refreshToken: string }>;
  generateAuthTokenStreamVideo: (uuid: string | undefined) => Promise<string>;
  generateEncryptionKeys: () => Promise<void>;
  changeEncryptionKey: (randomKey: Buffer) => Promise<void>;
  generateEmailVerifyToken: () => Promise<string>;
  generatePasswordResetToken: () => Promise<string>;
}

const maxAgeAccess = 60 * 1000 * 20 + 1000 * 60;
const maxAgeRefresh = 60 * 1000 * 60 * 24 * 30 + 1000 * 60;

const maxAgeAccessStreamVideo = 60 * 1000 * 60 * 24;

userSchema.pre("save", async function (this: any, next: any) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

userSchema.statics.findByCreds = async (email: string, password: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new NotAuthorizedError("User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new NotAuthorizedError("Incorrect password");
  }

  return user;
};

userSchema.methods.toJSON = function () {
  const user = this;

  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.tempTokens;
  delete userObject.privateKey;
  delete userObject.publicKey;

  if (env.emailVerification !== "true") {
    delete userObject.emailVerified;
  } else {
    userObject.emailVerified = user.emailVerified || false;
  }

  return userObject;
};

userSchema.methods.generateAuthTokenStreamVideo = async function (
  uuid: string | undefined
) {
  const iv = crypto.randomBytes(16);

  const user = this;

  const date = new Date();
  const time = date.getTime();

  let accessTokenStreamVideo = jwt.sign(
    { _id: user._id.toString(), iv, time },
    env.passwordAccess!,
    { expiresIn: maxAgeAccessStreamVideo.toString() }
  );

  const encryptionKey = user.getEncryptionKey();

  const encryptedToken = user.encryptToken(
    accessTokenStreamVideo,
    encryptionKey,
    iv
  );

  uuid = uuid ? uuid : "unknown";

  await User.updateOne(
    { _id: user._id },
    { $push: { tempTokens: { token: encryptedToken, uuid, time } } }
  );

  return accessTokenStreamVideo;
};

userSchema.methods.generateAuthToken = async function (
  uuid: string | undefined
) {
  const iv = crypto.randomBytes(16);

  const user = this;

  const date = new Date();
  const time = date.getTime();

  const userObj = {
    _id: user._id,
    emailVerified: user.emailVerified,
    email: user.email,
  };

  let accessToken = jwt.sign({ user: userObj, iv }, env.passwordAccess!, {
    expiresIn: maxAgeAccess.toString(),
  });
  let refreshToken = jwt.sign(
    { _id: user._id.toString(), iv, time },
    env.passwordRefresh!,
    { expiresIn: maxAgeRefresh.toString() }
  );

  const encryptionKey = user.getEncryptionKey();

  const encryptedToken = user.encryptToken(refreshToken, encryptionKey, iv);

  uuid = uuid ? uuid : "unknown";

  await User.updateOne(
    { _id: user._id },
    { $push: { tokens: { token: encryptedToken, uuid, time } } }
  );

  return { accessToken, refreshToken };
};

userSchema.methods.encryptToken = function (
  token: string,
  key: string,
  iv: any
) {
  iv = Buffer.from(iv, "hex");

  const TOKEN_CIPHER_KEY = crypto.createHash("sha256").update(key).digest();
  const cipher = crypto.createCipheriv("aes-256-cbc", TOKEN_CIPHER_KEY, iv);
  const encryptedText = cipher.update(token);

  return Buffer.concat([encryptedText, cipher.final()]).toString("hex");
};

userSchema.methods.decryptToken = function (
  encryptedToken: any,
  key: string,
  iv: any
) {
  encryptedToken = Buffer.from(encryptedToken, "hex");
  iv = Buffer.from(iv, "hex");

  const TOKEN_CIPHER_KEY = crypto.createHash("sha256").update(key).digest();
  const decipher = crypto.createDecipheriv("aes-256-cbc", TOKEN_CIPHER_KEY, iv);

  const tokenDecrypted = decipher.update(encryptedToken);

  return Buffer.concat([tokenDecrypted, decipher.final()]).toString();
};

userSchema.methods.generateEncryptionKeys = async function () {
  const user = this;
  const userPassword = user.password;
  const masterPassword = env.key!;

  const randomKey = crypto.randomBytes(32);

  const iv = crypto.randomBytes(16);
  const USER_CIPHER_KEY = crypto
    .createHash("sha256")
    .update(userPassword)
    .digest();
  const cipher = crypto.createCipheriv("aes-256-cbc", USER_CIPHER_KEY, iv);
  let encryptedText = cipher.update(randomKey);
  encryptedText = Buffer.concat([encryptedText, cipher.final()]);

  const MASTER_CIPHER_KEY = crypto
    .createHash("sha256")
    .update(masterPassword)
    .digest();
  const masterCipher = crypto.createCipheriv(
    "aes-256-cbc",
    MASTER_CIPHER_KEY,
    iv
  );
  const masterEncryptedText = masterCipher.update(encryptedText);

  user.privateKey = Buffer.concat([
    masterEncryptedText,
    masterCipher.final(),
  ]).toString("hex");
  user.publicKey = iv.toString("hex");

  await user.save();
};

userSchema.methods.getEncryptionKey = function () {
  try {
    const user = this;
    const userPassword = user.password;
    const masterEncryptedText = user.privateKey;
    const masterPassword = env.key!;
    const iv = Buffer.from(user.publicKey, "hex");

    const USER_CIPHER_KEY = crypto
      .createHash("sha256")
      .update(userPassword)
      .digest();
    const MASTER_CIPHER_KEY = crypto
      .createHash("sha256")
      .update(masterPassword)
      .digest();

    const unhexMasterText = Buffer.from(masterEncryptedText, "hex");
    const masterDecipher = crypto.createDecipheriv(
      "aes-256-cbc",
      MASTER_CIPHER_KEY,
      iv
    );
    let masterDecrypted = masterDecipher.update(unhexMasterText);
    masterDecrypted = Buffer.concat([masterDecrypted, masterDecipher.final()]);

    let decipher = crypto.createDecipheriv("aes-256-cbc", USER_CIPHER_KEY, iv);
    let decrypted = decipher.update(masterDecrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted;
  } catch (e) {
    console.log("Get Encryption Key Error", e);
    return undefined;
  }
};

userSchema.methods.changeEncryptionKey = async function (randomKey: Buffer) {
  const user = this;
  const userPassword = user.password;
  const masterPassword = env.key!;

  const iv = crypto.randomBytes(16);
  const USER_CIPHER_KEY = crypto
    .createHash("sha256")
    .update(userPassword)
    .digest();
  const cipher = crypto.createCipheriv("aes-256-cbc", USER_CIPHER_KEY, iv);
  let encryptedText = cipher.update(randomKey);
  encryptedText = Buffer.concat([encryptedText, cipher.final()]);

  const MASTER_CIPHER_KEY = crypto
    .createHash("sha256")
    .update(masterPassword)
    .digest();
  const masterCipher = crypto.createCipheriv(
    "aes-256-cbc",
    MASTER_CIPHER_KEY,
    iv
  );
  const masterEncryptedText = masterCipher.update(encryptedText);

  user.privateKey = Buffer.concat([
    masterEncryptedText,
    masterCipher.final(),
  ]).toString("hex");
  user.publicKey = iv.toString("hex");

  await user.save();
};

userSchema.methods.generateTempAuthToken = async function () {
  const iv = crypto.randomBytes(16);

  const user = this as UserInterface;
  const token = jwt.sign(
    { _id: user._id.toString(), iv },
    env.passwordAccess!,
    { expiresIn: "3000ms" }
  );

  const encryptionKey = user.getEncryptionKey();
  const encryptedToken = user.encryptToken(token, encryptionKey, iv);

  user.tempTokens = user.tempTokens.concat({ token: encryptedToken });

  await user.save();
  return token;
};

userSchema.methods.generateEmailVerifyToken = async function () {
  const iv = crypto.randomBytes(16);

  const user = this as UserInterface;
  const token = jwt.sign(
    { _id: user._id.toString(), iv },
    env.passwordAccess!,
    { expiresIn: "1d" }
  );

  const encryptionKey = user.getEncryptionKey();
  const encryptedToken = user.encryptToken(token, encryptionKey, iv);

  user.emailToken = encryptedToken;

  await user.save();
  return token;
};

userSchema.methods.generatePasswordResetToken = async function () {
  const iv = crypto.randomBytes(16);

  const user = this as UserInterface;
  const token = jwt.sign(
    { _id: user._id.toString(), iv },
    env.passwordAccess!,
    { expiresIn: "1h" }
  );

  const encryptionKey = user.getEncryptionKey();
  const encryptedToken = user.encryptToken(token, encryptionKey, iv);

  user.passwordResetToken = encryptedToken;

  await user.save();
  return token;
};

userSchema.methods.generateTempAuthTokenVideo = async function (
  cookie: string
) {
  const iv = crypto.randomBytes(16);

  const user = this;
  const token = jwt.sign(
    { _id: user._id.toString(), cookie, iv },
    env.passwordAccess!,
    { expiresIn: "5h" }
  );

  const encryptionKey = user.getEncryptionKey();
  const encryptedToken = user.encryptToken(token, encryptionKey, iv);

  user.tempTokens = user.tempTokens.concat({ token: encryptedToken });

  await user.save();
  return token;
};

const User = mongoose.model<UserInterface>("User", userSchema);

export default User;
module.exports = User;
