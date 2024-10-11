import { ObjectId } from "mongodb";
import User from "../../models/user-model";

// READ

class UserDB {
  constructor() {}

  getUserInfo = async (userID: string) => {
    const user = await User.findOne({ _id: new ObjectId(userID) });
    return user;
  };
}

export default UserDB;
