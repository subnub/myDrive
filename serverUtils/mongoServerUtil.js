const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    socketTimeoutMS: 30000000,
    keepAlive: true,
})

module.exports = mongoose;