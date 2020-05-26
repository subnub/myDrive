import mongoose from "mongoose";
import env from "../enviroment/env";

mongoose.connect(env.mongoURL!, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    socketTimeoutMS: 30000000,
    keepAlive: true,
})

export default mongoose;