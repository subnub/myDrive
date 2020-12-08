import User, {UserInterface} from "../../models/user";
import bcrypt from "bcrypt";
import NotFoundError from "../../utils/NotFoundError";
import InternalServerError from "../../utils/InternalServerError";
import sendEmailVerification from "../../utils/sendVerificationEmail";
import File from "../../models/file";
import env from "../../enviroment/env";
import getGoogleAuth from "../../db/googleAuth";
import { google } from "googleapis";
import jwt from "jsonwebtoken"
import sendVerificationEmail from "../../utils/sendVerificationEmail";
import sendPasswordResetEmail from "../../utils/sendPasswordResetEmail";
import ForbiddenError from "../../utils/ForbiddenError";

type UserDataType = {
    email: string,
    password: string,
}

type jwtType = {
    iv: Buffer,
    _id: string,
}


const uknownUserType = User as unknown;

const UserStaticType = uknownUserType as {
    findByCreds: (email: string, password: string) => Promise<UserInterface>;
};

class UserService {

    constructor() {

    }

    login = async(userData: UserDataType, uuid: string | undefined) => {

        const email = userData.email;
        const password = userData.password; 

        const user = await UserStaticType.findByCreds(email, password);

        if (!user) throw new NotFoundError("Cannot Find User");

        const {accessToken, refreshToken} = await user.generateAuthToken(uuid);

        if (!accessToken || !refreshToken) throw new NotFoundError("Login User Not Found Error");

        return {user, accessToken, refreshToken}
    }

    logout = async(userID: string, refreshToken: string) => {

        const user = await User.findById(userID);

        if (!user) throw new NotFoundError("Could Not Find User");

        if (refreshToken) {
            const decoded = jwt.verify(refreshToken, env.passwordRefresh!) as jwtType;  
            const encrpytionKey = user.getEncryptionKey();
            const encryptedToken = user.encryptToken(refreshToken, encrpytionKey, decoded.iv);

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
    }

    logoutAll = async(userID: string) => {

        const user = await User.findById(userID);

        if (!user) throw new NotFoundError("Could Not Find User");

        user.tokens = [];
        user.tempTokens = [];

        await user.save();
    }

    create = async(userData: any, uuid: string | undefined) => {

        const user = new User({email: userData.email, password: userData.password, emailVerified: env.disableEmailVerification});
        await user.save();

        if (!user) throw new NotFoundError("User Not Found");

        await user.generateEncryptionKeys();

        const {accessToken, refreshToken} = await user.generateAuthToken(uuid);
        const emailToken = await user.generateEmailVerifyToken();

        if (!env.disableEmailVerification) await sendEmailVerification(user, emailToken);

        if (!accessToken || !refreshToken) throw new InternalServerError("Could Not Create New User Error");

        return {user, accessToken, refreshToken}
    }

    changePassword = async(userID: string, oldPassword: string, newPassword: string, oldRefreshToken: string, uuid: string | undefined) => {

        const user = await User.findById(userID);

        if (!user) throw new NotFoundError("Could Not Find User");

        const date = new Date();

        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) throw new ForbiddenError("Change Passwords Do Not Match Error");

        const encryptionKey = user.getEncryptionKey();
        
        user.password = newPassword;

        user.tokens = [];
        user.tempTokens = [];
        user.passwordLastModified = date.getTime();

        await user.save();
        await user.changeEncryptionKey(encryptionKey!);
        
        const {accessToken, refreshToken} = await user.generateAuthToken(uuid);

        return {accessToken, refreshToken};
    }

    refreshStorageSize = async(userID: string) => {
        
        const user = await User.findById(userID);

        if (!user) throw new NotFoundError("Cannot find user");

        const fileList = await File.find({"metadata.owner": user._id, "metadata.personalFile": null});
    
        let size = 0;

        for (let currentFile of fileList) {
            
            size += currentFile.length;
        }

        user.storageData = {storageSize: size, storageLimit: 0};

        await user.save();
    }

    getUserDetailed = async(userID: string) => {

        const user = await User.findById(userID);
        
        if (!user) throw new NotFoundError("Cannot find user");

        if (user.s3Enabled) {

            try {
                const {bucket} = await user.decryptS3Data()
                user.s3Data!.bucket = bucket;
            } catch (e) {
                console.log("getting s3 storage data error");
                user.storageDataPersonal = {storageSize: 0, failed: true}
            }
            
        }
    
        if (user.googleDriveEnabled) {

            try {

                const {clientID} = await user.decryptDriveIDandKey()
    
                const oauth2Client = await getGoogleAuth(user);
                const drive = google.drive({version:"v3", auth: oauth2Client});
        
                const googleData = await drive.about.get({
                    fields: "storageQuota"
                })
        
                user.storageDataGoogle = {storageLimit: +googleData.data.storageQuota!.limit!, storageSize: +googleData.data.storageQuota!.usage!}
                user.googleDriveData!.id = clientID;

            } catch (e) {

                user.storageDataGoogle = {storageLimit: 0, storageSize: 0, failed: true}
                console.log("get google drive storage data error", e.message);
            }

        }
    
        if (!user.storageData || (!user.storageData.storageSize && !user.storageData.storageLimit)) user.storageData = {storageLimit: 0, storageSize: 0}
        if (!user.storageDataPersonal || (!user.storageDataPersonal.storageSize && !user.storageDataPersonal.failed)) user.storageDataPersonal = {storageSize: 0}
        if (!user.storageDataGoogle || (!user.storageDataGoogle.storageLimit && !user.storageDataGoogle.storageSize && !user.storageDataGoogle.failed)) user.storageDataGoogle = {storageLimit: 0, storageSize: 0}

        return user;
    }

    verifyEmail = async(verifyToken: any) => {

        const decoded: any = jwt.verify(verifyToken!, env.passwordAccess!);
   
        const iv = decoded.iv;
        
        const user = await User.findOne({_id: decoded._id}) as UserInterface;
        const encrpytionKey = user.getEncryptionKey();
        const encryptedToken = user.encryptToken(verifyToken, encrpytionKey, iv);

        if (encryptedToken === user.emailToken) {
            user.emailVerified = true;
            await user.save();
            return user;
            
        } else {
            throw new ForbiddenError('Email Token Verification Failed')
        }
    }

    resendVerifyEmail = async(userID: string) => {

        const user = await User.findById(userID);

        if (!user) throw new NotFoundError("Cannot find user")

        const verifiedEmail = user.emailVerified;

        if (!verifiedEmail) {

            const emailToken = await user.generateEmailVerifyToken();
            await sendVerificationEmail(user, emailToken);

        } else {
            throw new ForbiddenError("Email Already Authorized")
        }
    }

    sendPasswordReset = async(email: string) => {

        const user = await User.findOne({email});

        if (!user) throw new NotFoundError("User Not Found Password Reset Email")

        const passwordResetToken = await user.generatePasswordResetToken();

        await sendPasswordResetEmail(user, passwordResetToken!);
    }

    resetPassword = async(newPassword: string, verifyToken: any) => {

        const decoded: any = jwt.verify(verifyToken!, env.passwordAccess!);
   
        const iv = decoded.iv;

        const user = await User.findOne({_id: decoded._id}) as UserInterface;
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
            throw new ForbiddenError("Reset Password Token Do Not Match")
        }
    }
    
    addName = async(userID: string, name: string) => {

        if (!name || name.length === 0) throw new ForbiddenError("No name")

        const user = await User.findById(userID);

        if (!user) throw new NotFoundError("Cannot find user")

        user.name = name;
        await user.save();
    }
}

export default UserService;