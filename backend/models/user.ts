import mongoose, {Document} from "mongoose";
import validator from "validator";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "../enviroment/env";

const userSchema = new mongoose.Schema({

    name: 
        {
            type:String,
        },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true, 
        lowercase: true,
        validate(value: any): any {
            if (!validator.isEmail(value)) {
                throw new Error("Email is invalid");
            }
        }
    }, 
    password: {
        type: String, 
        trim: true, 
        required: true, 
        validate(value: any): any {
            if (value.length < 6) {
                throw new Error("Password Length Not Sufficent");
            }
        }
    },
    tokens:[{
        token: {
            type: String, 
            required: true
        },
        uuid: {
            type: String,
            required: true,
        },
        time: {
            type: Number,
            required: true
        }
    }],
    tempTokens: [{
        token: {
            type: String, 
            required: true
        },
        uuid: {
            type: String,
            required: true,
        },
        time: {
            type: Number,
            required: true
        }
    }],
    privateKey: {
        type: String, 
    },
    publicKey: {
        type: String, 
    },
    emailVerified: {
        type: Boolean
    },
    emailToken: {
        type: String,
    },
    passwordResetToken: {
        type: String
    },
    googleDriveEnabled: {
        type: Boolean
    },
    googleDriveData: {

        id: {
            type: String
        },
        key: {
            type: String
        },
        iv: {
            type: Buffer
        },
        token: {
            type: String
        }
    },
    s3Enabled: {
        type: Boolean
    },
    s3Data: {
        id: {
            type: String
        }, 
        key: {
            type: String
        },
        bucket: {
            type: String
        },
        iv: {
            type: Buffer
        }
    },
    personalStorageCanceledDate: Number,
    storageData: {
        storageSize: Number,
        storageLimit: Number,
        failed: Boolean,
    },
    storageDataPersonal: {
        storageSize: Number,
        failed: Boolean,
    },
    storageDataGoogle: {
        storageSize: Number,
        storageLimit: Number,
        failed: Boolean,
    },
    activeSubscription: Boolean,
    planID: String,
    passwordLastModified: Number,
    lastSubscriptionCheckTime: Number,
    lastSubscriptionStatus: Boolean
}, {
    timestamps: true
})

export interface UserInterface extends Document {
    _id: string,
    name: string,
    email: string,
    password: string,
    tokens: any[],
    tempTokens: any[],
    privateKey?: string,
    publicKey?: string,
    token?: string,
    emailVerified?: boolean,
    emailToken?: string,
    passwordResetToken?: string,
    googleDriveEnabled?: boolean,
    googleDriveData?: {
        id?: string,
        key?: string,
        iv?: Buffer,
        token?: string,
    },
    s3Enabled?: boolean,
    s3Data?: {
        id?: string,
        key?: string,
        bucket?: string,
        iv?: Buffer,
    },
    storageData?: {
        storageSize?: number,
        storageLimit?: number,
        failed?: boolean,
    },
    storageDataPersonal?: {
        storageSize?: number,
        failed?: boolean,
    },
    storageDataGoogle?: {
        storageSize?: number,
        storageLimit?: number,
        failed?: boolean,
    }, 
    activeSubscription?: boolean,
    passwordLastModified?: number,
    personalStorageCanceledDate?: number,
    planID?: string,
    lastSubscriptionCheckTime?: number,
    lastSubscriptionStatus?: boolean,

    getEncryptionKey: () => Buffer | undefined;
    generateTempAuthToken: () => Promise<any>;
    encryptToken: (tempToken: any, key: any, publicKey: any) => any;
    decryptToken: (encryptedToken: any, key: any, publicKey: any) => any;
    findByCreds: (email: string, password: string) => Promise<UserInterface>;
    generateAuthToken: (uuid: string | undefined) => Promise<{accessToken: string, refreshToken: string}>
    generateAuthTokenStreamVideo: (uuid: string | undefined) => Promise<string>
    generateEncryptionKeys: () => Promise<void>;
    changeEncryptionKey: (randomKey: Buffer) => Promise<void>; 
    generateEmailVerifyToken: () => Promise<string>;
    generatePasswordResetToken: () => Promise<string>;
    encryptDriveIDandKey: (ID:string, key: string) => Promise<void>; 
    decryptDriveIDandKey: () => Promise<{clientID: string, clientKey: string}>;
    encryptDriveTokenData: (token: Object) => Promise<void>;
    decryptDriveTokenData: () => Promise<any>;
    encryptS3Data: (id: string, key: string, bucket: string) => Promise<void>;
    decryptS3Data: () => Promise<{id: string, key: string, bucket: string}>
}

const maxAgeAccess =  60 * 1000 * 20 + (1000 * 60);
const maxAgeRefresh = 60 * 1000 * 60 * 24 * 30 + (1000 * 60);

const maxAgeAccessStreamVideo = 60 * 1000 * 60 * 24;

userSchema.pre("save", async function(this: any, next: any) {
    
    const user = this; 

    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
})

userSchema.statics.findByCreds = async(email: string, password: string) => {

    const user = await User.findOne({email});

    if (!user) {

        throw new Error("User not found")
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error("Incorrect password");
    }

    return user;
}

userSchema.methods.toJSON = function() {

    const user = this;

    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.tempTokens;
    delete userObject.privateKey;
    delete userObject.publicKey;

    return userObject;
}

userSchema.methods.generateAuthTokenStreamVideo = async function(uuid: string | undefined) {

    const iv = crypto.randomBytes(16);

    const user = this;

    const date = new Date();
    const time = date.getTime();
    
    let accessTokenStreamVideo = jwt.sign({_id:user._id.toString(), iv, time}, env.passwordAccess!, {expiresIn: maxAgeAccessStreamVideo.toString()});

    const encryptionKey = user.getEncryptionKey();

    const encryptedToken = user.encryptToken(accessTokenStreamVideo, encryptionKey, iv);

    uuid = uuid ? uuid : "unknown";

    await User.updateOne({_id: user._id}, {$push: {"tempTokens": {token: encryptedToken, uuid, time}}});

    return accessTokenStreamVideo;
}

userSchema.methods.generateAuthToken = async function(uuid: string | undefined) {

    const iv = crypto.randomBytes(16);

    const user = this;

    const date = new Date();
    const time = date.getTime();

    const userObj = {_id: user._id, emailVerified: user.emailVerified || env.disableEmailVerification, email: user.email, s3Enabled: user.s3Enabled, googleDriveEnabled: user.googleDriveEnabled}
    
    let accessToken = jwt.sign({user: userObj, iv}, env.passwordAccess!, {expiresIn: maxAgeAccess.toString()});
    let refreshToken = jwt.sign({_id:user._id.toString(), iv, time}, env.passwordRefresh!, {expiresIn: maxAgeRefresh.toString()});

    const encryptionKey = user.getEncryptionKey();

    const encryptedToken = user.encryptToken(refreshToken, encryptionKey, iv);

    //user.tokens = user.tokens.concat({token: encryptedToken});

    uuid = uuid ? uuid : "unknown";

    await User.updateOne({_id: user._id}, {$push: {"tokens": {token: encryptedToken, uuid, time}}})

    // console.log("saving user")
    // console.log("user saved")
    return {accessToken, refreshToken};

    // const iv = crypto.randomBytes(16);

    // const user = this; 
    // let token = jwt.sign({_id:user._id.toString(), iv}, env.passwordAccess!);

    // const encryptionKey = user.getEncryptionKey();

    // const encryptedToken = user.encryptToken(token, encryptionKey, iv);

    // user.tokens = user.tokens.concat({token: encryptedToken});

    // await user.save();
    // return token;
}

userSchema.methods.encryptToken = function(token: string, key: string, iv: any) {

    iv = Buffer.from(iv, "hex")

    const TOKEN_CIPHER_KEY = crypto.createHash('sha256').update(key).digest();
    const cipher = crypto.createCipheriv('aes-256-cbc', TOKEN_CIPHER_KEY, iv);
    const encryptedText = cipher.update(token);

    return Buffer.concat([encryptedText, cipher.final()]).toString("hex");;
}

userSchema.methods.decryptToken = function(encryptedToken: any, key: string, iv: any) {

    encryptedToken = Buffer.from(encryptedToken, "hex");
    iv = Buffer.from(iv, "hex")

    const TOKEN_CIPHER_KEY = crypto.createHash('sha256').update(key).digest();  
    const decipher = crypto.createDecipheriv('aes-256-cbc', TOKEN_CIPHER_KEY, iv)
    
    const tokenDecrypted = decipher.update(encryptedToken);

    return Buffer.concat([tokenDecrypted, decipher.final()]).toString();
}

userSchema.methods.generateEncryptionKeys = async function() {

    const user = this;
    const userPassword = user.password;
    const masterPassword = env.key!;

    const randomKey = crypto.randomBytes(32);

    const iv = crypto.randomBytes(16);
    const USER_CIPHER_KEY = crypto.createHash('sha256').update(userPassword).digest();
    const cipher = crypto.createCipheriv('aes-256-cbc', USER_CIPHER_KEY, iv);
    let encryptedText = cipher.update(randomKey);
    encryptedText = Buffer.concat([encryptedText, cipher.final()]);

    const MASTER_CIPHER_KEY = crypto.createHash('sha256').update(masterPassword).digest();
    const masterCipher = crypto.createCipheriv('aes-256-cbc', MASTER_CIPHER_KEY, iv);
    const masterEncryptedText = masterCipher.update(encryptedText);

    user.privateKey = Buffer.concat([masterEncryptedText, masterCipher.final()]).toString("hex");
    user.publicKey = iv.toString("hex");

    await user.save();
}

userSchema.methods.getEncryptionKey = function() {

    try {
        const user = this;
        const userPassword = user.password;
        const masterEncryptedText = user.privateKey;
        const masterPassword = env.key!;
        const iv = Buffer.from(user.publicKey, "hex");

        const USER_CIPHER_KEY = crypto.createHash('sha256').update(userPassword).digest();
        const MASTER_CIPHER_KEY = crypto.createHash('sha256').update(masterPassword).digest();

        const unhexMasterText = Buffer.from(masterEncryptedText, "hex");
        const masterDecipher = crypto.createDecipheriv('aes-256-cbc', MASTER_CIPHER_KEY, iv)
        let masterDecrypted = masterDecipher.update(unhexMasterText);
        masterDecrypted = Buffer.concat([masterDecrypted, masterDecipher.final()])

        let decipher = crypto.createDecipheriv('aes-256-cbc', USER_CIPHER_KEY, iv);
        let decrypted = decipher.update(masterDecrypted);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted;

    } catch (e) {

        console.log("Get Encryption Key Error", e);
        return undefined;
    }
}

userSchema.methods.changeEncryptionKey = async function(randomKey: Buffer) {

    const user = this;
    const userPassword = user.password;
    const masterPassword = env.key!;

    const iv = crypto.randomBytes(16);
    const USER_CIPHER_KEY = crypto.createHash('sha256').update(userPassword).digest();
    const cipher = crypto.createCipheriv('aes-256-cbc', USER_CIPHER_KEY, iv);
    let encryptedText = cipher.update(randomKey);
    encryptedText = Buffer.concat([encryptedText, cipher.final()]);

    const MASTER_CIPHER_KEY = crypto.createHash('sha256').update(masterPassword).digest();
    const masterCipher = crypto.createCipheriv('aes-256-cbc', MASTER_CIPHER_KEY, iv);
    const masterEncryptedText = masterCipher.update(encryptedText);

    user.privateKey = Buffer.concat([masterEncryptedText, masterCipher.final()]).toString("hex");
    user.publicKey = iv.toString("hex");

    await user.save();
}

userSchema.methods.generateTempAuthToken = async function() {

    const iv = crypto.randomBytes(16);

    const user = this as UserInterface; 
    const token = jwt.sign({_id:user._id.toString(), iv}, env.passwordAccess!, {expiresIn: "3000ms"});

    const encryptionKey = user.getEncryptionKey();
    const encryptedToken = user.encryptToken(token, encryptionKey, iv);

    user.tempTokens = user.tempTokens.concat({token: encryptedToken});

    await user.save();
    return token;
}

userSchema.methods.generateEmailVerifyToken = async function() {

    const iv = crypto.randomBytes(16);

    const user = this as UserInterface; 
    const token = jwt.sign({_id:user._id.toString(), iv}, env.passwordAccess!, {expiresIn: "1d"});

    const encryptionKey = user.getEncryptionKey();
    const encryptedToken = user.encryptToken(token, encryptionKey, iv);

    user.emailToken = encryptedToken;

    await user.save();
    return token;
}

userSchema.methods.encryptDriveIDandKey = async function(ID: string, key: string) {

    const iv = crypto.randomBytes(16);

    const user = this as UserInterface; 
    
    const encryptedKey = user.getEncryptionKey();

    const encryptedDriveID = user.encryptToken(ID, encryptedKey, iv);
    const encryptedDriveKey = user.encryptToken(key, encryptedKey, iv);
    
    if (!user.googleDriveData) user.googleDriveData = {};

    user.googleDriveData!.id = encryptedDriveID;
    user.googleDriveData!.key = encryptedDriveKey;
    user.googleDriveData!.iv = iv;

    await user.save();
}

userSchema.methods.decryptDriveIDandKey = async function() {
    
    const user = this as UserInterface; 
    
    const iv = user.googleDriveData!.iv;

    const encryptedKey = user.getEncryptionKey();

    const encryptedDriveID = user.googleDriveData?.id;
    const encryptedDriveKey = user.googleDriveData?.key;

    const decryptedDriveID = user.decryptToken(encryptedDriveID, encryptedKey, iv)
    const decryptedDriveKey = user.decryptToken(encryptedDriveKey, encryptedKey, iv);
    
   return {
       clientID: decryptedDriveID, 
       clientKey: decryptedDriveKey
   }
}

userSchema.methods.encryptDriveTokenData = async function(token: Object) {
    
    const user = this as UserInterface; 
    const iv = user.googleDriveData?.iv;

    const tokenToString = JSON.stringify(token);
    
    const encryptedKey = user.getEncryptionKey();

    const encryptedDriveToken = user.encryptToken(tokenToString, encryptedKey, iv);;
    
    if (!user.googleDriveData) user.googleDriveData = {};

    user.googleDriveData.token = encryptedDriveToken;
    user.googleDriveEnabled = true;

    await user.save();
}

userSchema.methods.decryptDriveTokenData = async function() {
    
    const user = this as UserInterface; 
    
    const iv = user.googleDriveData!.iv;

    const encryptedKey = user.getEncryptionKey();

    const encryptedToken = user.googleDriveData?.token;

    const decryptedToken = user.decryptToken(encryptedToken, encryptedKey, iv);

    const tokenToObj = JSON.parse(decryptedToken);
    
   return tokenToObj;
}

userSchema.methods.encryptS3Data = async function(ID: string, key: string, bucket: string) {

    const iv = crypto.randomBytes(16);

    const user = this as UserInterface; 
    
    const encryptedKey = user.getEncryptionKey();

    const encryptedS3ID = user.encryptToken(ID, encryptedKey, iv);
    const encryptedS3Key = user.encryptToken(key, encryptedKey, iv);
    const encryptedS3Bucket = user.encryptToken(bucket, encryptedKey, iv);
    
    if (!user.s3Data) user.s3Data = {};

    user.s3Data!.id = encryptedS3ID;
    user.s3Data!.key = encryptedS3Key;
    user.s3Data!.bucket = encryptedS3Bucket;
    user.s3Data!.iv = iv;
    user.s3Enabled = true;

    await user.save();
}

userSchema.methods.decryptS3Data = async function() {

    const user = this as UserInterface; 

    const iv = user.s3Data?.iv;

    const encryptedKey = user.getEncryptionKey();

    const encrytpedS3ID = user.s3Data?.id;
    const encryptedS3Key = user.s3Data?.key;
    const encryptedS3Bucket = user.s3Data?.bucket;

    const decrytpedS3ID = user.decryptToken(encrytpedS3ID, encryptedKey, iv);
    const decryptedS3Key = user.decryptToken(encryptedS3Key, encryptedKey, iv);
    const decryptedS3Bucket = user.decryptToken(encryptedS3Bucket, encryptedKey, iv);

    //console.log("decrypted keys", decrytpedS3ID, decryptedS3Key, decryptedS3Bucket);

    return {
        id: decrytpedS3ID,
        key: decryptedS3Key,
        bucket: decryptedS3Bucket,
    }
}

userSchema.methods.generatePasswordResetToken = async function() {

    const iv = crypto.randomBytes(16);

    const user = this as UserInterface; 
    const token = jwt.sign({_id:user._id.toString(), iv}, env.passwordAccess!, {expiresIn: "1h"});

    const encryptionKey = user.getEncryptionKey();
    const encryptedToken = user.encryptToken(token, encryptionKey, iv);

    user.passwordResetToken = encryptedToken;

    await user.save();
    return token;
}

userSchema.methods.generateTempAuthTokenVideo = async function(cookie: string) {

    const iv = crypto.randomBytes(16);

    const user = this; 
    const token = jwt.sign({_id:user._id.toString(), cookie, iv}, env.passwordAccess!, {expiresIn:"5h"});

    const encryptionKey = user.getEncryptionKey();
    const encryptedToken = user.encryptToken(token, encryptionKey, iv);
    
    user.tempTokens = user.tempTokens.concat({token: encryptedToken});
    
    await user.save();
    return token;
}

const User = mongoose.model<UserInterface>("User", userSchema);

export default User;
module.exports = User;