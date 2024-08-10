import mongoose from "mongoose";
import env from "../../enviroment/env";

mongoose.connect(env.mongoURL!, {
  socketTimeoutMS: 30000000,
});

export default mongoose;
