"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const validator = require("validator");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const env = require("../enviroment/env");
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Email is invalid");
            }
        }
    },
    password: {
        type: String,
        trim: true,
        required: true,
        validate(value) {
            if (value.length < 6) {
                throw new Error("Password Length Not Sufficent");
            }
        }
    },
    tokens: [{
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
});
// userSchema.virtual("files", {
//     ref: "fs.files",
//     localField: "_id"
// })
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        if (user.isModified("password")) {
            user.password = yield bcrypt.hash(user.password, 8);
        }
        next();
    });
});
userSchema.statics.findByCreds = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User.findOne({ email });
    if (!user) {
        throw new Error("User not found");
    }
    const isMatch = yield bcrypt.compare(password, user.password);
    if (!isMatch) {
        console.log("incorrect password");
        throw new Error("Incorrect password");
    }
    return user;
});
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.tempTokens;
    return userObject;
};
userSchema.methods.generateAuthToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const iv = crypto.randomBytes(16);
        const user = this;
        let token = jwt.sign({ _id: user._id.toString(), iv }, env.password);
        const publicKey = user.publicKey;
        const encryptionKey = user.getEncryptionKey();
        const encryptedToken = user.encryptToken(token, encryptionKey, iv);
        user.tokens = user.tokens.concat({ token: encryptedToken });
        yield user.save();
        return token;
    });
};
userSchema.methods.encryptToken = function (token, key, iv) {
    iv = Buffer.from(iv, "hex");
    const TOKEN_CIPHER_KEY = crypto.createHash('sha256').update(key).digest();
    const cipher = crypto.createCipheriv('aes-256-cbc', TOKEN_CIPHER_KEY, iv);
    let encryptedText = cipher.update(token);
    encryptedText = Buffer.concat([encryptedText, cipher.final()]).toString("hex");
    return encryptedText;
};
userSchema.methods.decryptToken = function (encryptedToken, key, iv) {
    encryptedToken = Buffer.from(encryptedToken, "hex");
    iv = Buffer.from(iv, "hex");
    const TOKEN_CIPHER_KEY = crypto.createHash('sha256').update(key).digest();
    const decipher = crypto.createDecipheriv('aes-256-cbc', TOKEN_CIPHER_KEY, iv);
    let tokenDecrypted = decipher.update(encryptedToken);
    tokenDecrypted = Buffer.concat([tokenDecrypted, decipher.final()]).toString();
    return tokenDecrypted;
};
userSchema.methods.generateEncryptionKeys = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        const userPassword = user.password;
        const masterPassword = env.key;
        const randomKey = crypto.randomBytes(32);
        const iv = crypto.randomBytes(16);
        const USER_CIPHER_KEY = crypto.createHash('sha256').update(userPassword).digest();
        const cipher = crypto.createCipheriv('aes-256-cbc', USER_CIPHER_KEY, iv);
        let encryptedText = cipher.update(randomKey);
        encryptedText = Buffer.concat([encryptedText, cipher.final()]);
        const MASTER_CIPHER_KEY = crypto.createHash('sha256').update(masterPassword).digest();
        const masterCipher = crypto.createCipheriv('aes-256-cbc', MASTER_CIPHER_KEY, iv);
        let masterEncryptedText = masterCipher.update(encryptedText);
        masterEncryptedText = Buffer.concat([masterEncryptedText, masterCipher.final()]).toString("hex");
        user.privateKey = masterEncryptedText;
        user.publicKey = iv.toString("hex");
        yield user.save();
    });
};
userSchema.methods.getEncryptionKey = function () {
    const user = this;
    const userPassword = user.password;
    const masterEncryptedText = user.privateKey;
    const masterPassword = env.key;
    const iv = Buffer.from(user.publicKey, "hex");
    const USER_CIPHER_KEY = crypto.createHash('sha256').update(userPassword).digest();
    const MASTER_CIPHER_KEY = crypto.createHash('sha256').update(masterPassword).digest();
    const unhexMasterText = Buffer.from(masterEncryptedText, "hex");
    const masterDecipher = crypto.createDecipheriv('aes-256-cbc', MASTER_CIPHER_KEY, iv);
    let masterDecrypted = masterDecipher.update(unhexMasterText);
    masterDecrypted = Buffer.concat([masterDecrypted, masterDecipher.final()]);
    let decipher = crypto.createDecipheriv('aes-256-cbc', USER_CIPHER_KEY, iv);
    let decrypted = decipher.update(masterDecrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted;
};
userSchema.methods.changeEncryptionKey = function (randomKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        const userPassword = user.password;
        const masterPassword = env.key;
        const iv = crypto.randomBytes(16);
        const USER_CIPHER_KEY = crypto.createHash('sha256').update(userPassword).digest();
        const cipher = crypto.createCipheriv('aes-256-cbc', USER_CIPHER_KEY, iv);
        let encryptedText = cipher.update(randomKey);
        encryptedText = Buffer.concat([encryptedText, cipher.final()]);
        const MASTER_CIPHER_KEY = crypto.createHash('sha256').update(masterPassword).digest();
        const masterCipher = crypto.createCipheriv('aes-256-cbc', MASTER_CIPHER_KEY, iv);
        let masterEncryptedText = masterCipher.update(encryptedText);
        masterEncryptedText = Buffer.concat([masterEncryptedText, masterCipher.final()]).toString("hex");
        user.privateKey = masterEncryptedText;
        user.publicKey = iv.toString("hex");
        yield user.save();
    });
};
userSchema.methods.generateTempAuthToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        // const user = this; 
        // let token = jwt.sign({_id:user._id.toString()}, env.password);
        // const publicKey = user.publicKey;
        // const encryptionKey = user.getEncryptionKey();
        // const encryptedToken = user.encryptToken(token, encryptionKey, publicKey);
        // user.tokens = user.tokens.concat({token: encryptedToken});
        // await user.save();
        // return token;
        const iv = crypto.randomBytes(16);
        const user = this;
        const token = jwt.sign({ _id: user._id.toString(), iv }, env.password, { expiresIn: 2 });
        const publicKey = user.publicKey;
        const encryptionKey = user.getEncryptionKey();
        const encryptedToken = user.encryptToken(token, encryptionKey, iv);
        user.tempTokens = user.tempTokens.concat({ token: encryptedToken });
        yield user.save();
        return token;
    });
};
userSchema.methods.generateTempAuthTokenVideo = function (cookie) {
    return __awaiter(this, void 0, void 0, function* () {
        const iv = crypto.randomBytes(16);
        const user = this;
        const token = jwt.sign({ _id: user._id.toString(), cookie, iv }, env.password, { expiresIn: "5h" });
        //const publicKey = user.publicKey;
        const encryptionKey = user.getEncryptionKey();
        const encryptedToken = user.encryptToken(token, encryptionKey, iv);
        //user.tempTokens = user.tempTokens.concat({token});
        user.tempTokens = user.tempTokens.concat({ token: encryptedToken });
        yield user.save();
        return token;
    });
};
const User = mongoose_1.default.model("User", userSchema);
module.exports = User;
