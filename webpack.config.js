// Entry Point -> Output
const webpack = require("webpack")
const CompressionPlugin = require("compression-webpack-plugin");


const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require("path");

process.env.NODE_ENV = process.env.NODE_ENV || "development"

console.log("node env", process.env.NODE_ENV);

if (process.env.NODE_ENV === "test") {

    require("dotenv").config({path: ".env.test"})

} else if (process.env.NODE_ENV === "development") {

    require("dotenv").config({path: ".env.development"})

} else {
    require("dotenv").config({path: ".env.production"});
}

module.exports = (env) => {

    const isProduction = (env === "production" || env === "production-no-ssl")
    console.log("is prod", isProduction);
    
    const CSSExtract = new MiniCssExtractPlugin({ filename: 'styles.css' });
    return {

        entry:'./src/app.js',
        output: {
            path: path.join(__dirname, "public", "dist"),
            filename: "bundle.js"
        },
        module: {
            rules: [{
                loader: "babel-loader",
                test: /\.js$/,
                exclude: /node_modules/
            }, {
                test: /\.s?css$/,
                use: [
					{
						loader: MiniCssExtractPlugin.loader
					},
					{
						loader: 'css-loader',
						options: {
							sourceMap: true
						}
					},
					{
						loader: 'sass-loader',
						options: {
                            implementation: require("dart-sass") ,
							sourceMap: true
						}
					}
				]
            }]
        },
        plugins: [
            CSSExtract,
            new webpack.DefinePlugin({
                "process.env.PORT": JSON.stringify(process.env.PORT),
                "process.env.REMOTE_URL": JSON.stringify(process.env.REMOTE_URL),
                "process.env.ENABLE_VIDEO_TRANSCODING": JSON.stringify(process.env.ENABLE_VIDEO_TRANSCODING)
            }),
            new CompressionPlugin()
        ],
        devtool: isProduction ? "source-map" : "inline-source-map",
        devServer: {
            contentBase: path.join(__dirname, "public"),
            historyApiFallback: true,
            publicPath: "/dist/"
        },

    }
}

