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
            trim: true
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
        }
    }],
    tempTokens: [{
        token: {
            type: String, 
            required: true
        }
    }],
    privateKey: {
        type: String, 
    },
    publicKey: {
        type: String, 
    }

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

    getEncryptionKey: () => Buffer | undefined;
    generateTempAuthToken: () => any;
    generateTempAuthTokenVideo: (cookie: string) => any;
    encryptToken: (tempToken: any, key: any, publicKey: any) => any;
    findByCreds: (email: string, password: string) => UserInterface;
    generateAuthToken: () => any;
    generateEncryptionKeys: () => Promise<void>;
    changeEncryptionKey: (randomKey: Buffer) => void; 
}

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
        console.log("incorrect password")
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

    return userObject;
}

userSchema.methods.generateAuthToken = async function() {

    const iv = crypto.randomBytes(16);

    const user = this; 
    let token = jwt.sign({_id:user._id.toString(), iv}, env.password!);

    const encryptionKey = user.getEncryptionKey();

    const encryptedToken = user.encryptToken(token, encryptionKey, iv);

    user.tokens = user.tokens.concat({token: encryptedToken});

    await user.save();
    return token;
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
    const token = jwt.sign({_id:user._id.toString(), iv}, env.password!, {expiresIn: "3000ms"});

    const encryptionKey = user.getEncryptionKey();
    const encryptedToken = user.encryptToken(token, encryptionKey, iv);

    user.tempTokens = user.tempTokens.concat({token: encryptedToken});

    await user.save();
    return token;
}

userSchema.methods.generateTempAuthTokenVideo = async function(cookie: string) {

    const iv = crypto.randomBytes(16);

    const user = this; 
    const token = jwt.sign({_id:user._id.toString(), cookie, iv}, env.password!, {expiresIn:"5h"});

    const encryptionKey = user.getEncryptionKey();
    const encryptedToken = user.encryptToken(token, encryptionKey, iv);
    
    user.tempTokens = user.tempTokens.concat({token: encryptedToken});
    
    await user.save();
    return token;
}

const User = mongoose.model<UserInterface>("User", userSchema);

export default User;