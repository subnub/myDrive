import User, {UserInterface} from "../../models/user";
import bcrypt from "bcrypt";
import NotFoundError from "../../utils/NotFoundError";
import InternalServerError from "../../utils/InternalServerError";
import NotAuthorizedError from "../../utils/NotAuthorizedError";

type UserDataType = {
    email: string,
    password: string,
}

const uknownUserType = User as unknown;

const UserStaticType = uknownUserType as {
    findByCreds: (email: string, password: string) => Promise<UserInterface>;
};


class UserService {

    constructor() {

    }

    login = async(userData: UserDataType) => {

        const email = userData.email;
        const password = userData.password; 

        const user = await UserStaticType.findByCreds(email, password);

        const token = await user.generateAuthToken();

        if (!user || !token) throw new NotFoundError("Login User Not Found Error");

        return {user, token}
    }

    logout = async(user: UserInterface, userToken: any) => {

        user.tokens = user.tokens.filter((token) => {
            return token.token !== userToken;
        })

        await user.save();
    }

    logoutAll = async(user: UserInterface) => {

        user.tokens = []
        user.tempTokens = [];

        await user.save();
    }

    create = async(userData: any) => {

        console.log("Create");

        const user = new User(userData);
        await user.save();

        await user.generateEncryptionKeys();

        const token = await user.generateAuthToken();

        if (!user || !token) throw new InternalServerError("Could Not Create New User Error");

        return {user, token}
    }

    changePassword = async(user: UserInterface, oldPassword: string, newPassword: string) => {

        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) throw new NotAuthorizedError("Change Passwords Do Not Match Error");

        const encryptionKey = user.getEncryptionKey();
        
        user.password = newPassword;

        user.tokens = [];
        user.tempTokens = [];
        
        await user.save();
        await user.changeEncryptionKey(encryptionKey!);
        
        const newToken = await user.generateAuthToken();

        return newToken;
    }

}

export default UserService;