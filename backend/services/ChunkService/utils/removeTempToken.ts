import { UserInterface } from "../../../models/userModel";

const removeTempToken = async (user: UserInterface, tempToken: any) => {
  user.tempTokens = user.tempTokens.filter((filterToken) => {
    return filterToken.token !== tempToken;
  });

  await user.save();
};

export default removeTempToken;
