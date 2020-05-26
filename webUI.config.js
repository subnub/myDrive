const path = require('path');
const webpack = require("webpack")
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env) => { 
    
    if (env === "test") {

        console.log("Loading test env variables")
        require("dotenv").config({path: ".env.test"})

    } else if (env === "development") {

        console.log("Loading development env variables")
        require("dotenv").config({path: ".env.development"})

    } else {

        console.log("Loading production env variables")
        require("dotenv").config({path: ".env.production"});
    }
    
    return {
        entry: './webUI/src/index.js',
        output: {
            path: path.resolve(__dirname, 'webUI', "dist"),
            filename: 'bundle.js'
        },
        plugins: [
            new webpack.DefinePlugin({
                "process.env.PORT": JSON.stringify(process.env.PORT),
                "process.env.REMOTE_URL": JSON.stringify(process.env.REMOTE_URL),
                "process.env.ENABLE_VIDEO_TRANSCODING": JSON.stringify(process.env.ENABLE_VIDEO_TRANSCODING),
                "process.env.DISABLE_STORAGE": JSON.stringify(process.env.DISABLE_STORAGE),
                "process.env.SERVER_IP": JSON.stringify(process.env.SERVER_IP)
            }),
        ],
}};