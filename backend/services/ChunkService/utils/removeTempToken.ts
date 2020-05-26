import { UserInterface } from "../../../models/user";

const removeTempToken = async(user: UserInterface, tempToken: any,) => {

    user.tempTokens = user.tempTokens.filter((filterToken) => {
            
        return filterToken.token !== tempToken;
    })
            
    await user.save();
}

export default removeTempToken;