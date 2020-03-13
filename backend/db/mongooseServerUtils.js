const mongoose = require("mongoose");
const env = require("../enviroment/env");

mongoose.connect(env.mongoURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    socketTimeoutMS: 30000000,
    keepAlive: true,
})

module.exports = mongoose;