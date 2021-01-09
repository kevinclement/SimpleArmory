"use strict";

const glob = require("glob");
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

// Copy public files to dist
const patterns = [
    {
        from: "node_modules/bootstrap/dist/css/bootstrap.css",
        to: "bootstrap/css",
    },
    {
        from: "node_modules/angular-ui-select/select.css",
        to: "bootstrap/select",
    },
    {
        from: "node_modules/bootstrap/dist/fonts",
        to: "bootstrap/fonts",
    },
    {
        from: "app/views",
        to: "views",
    },
    {
        from: "app/images",
        to: "images",
    },
    {
        from: "app/audio",
        to: "audio",
    },
    {
        from: "app/data",
        to: "data",
    },
    {
        from: "app/styles",
        to: "styles",
    },
    {
        from: "app/favicon.ico",
        to: "",
    },
    {
        from: "app/robots.txt",
        to: "",
    },
    {
        from: "app/web.config",
        to: "",
    },
];

module.exports = (env, options) => ({
    mode: options.mode,
    entry: {
        angular: [
            "./node_modules/angular/angular",
            "./node_modules/angular-route/angular-route",
            "./node_modules/angular-sanitize/angular-sanitize",
            "./node_modules/angular-ui-select/select",
        ],
        bootstrap: ["./node_modules/angular-ui-bootstrap/ui-bootstrap-tpls"],
        main: glob.sync("./app/scripts/**/*.js"),
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        publicPath: "",
        filename: "[name].bundle-[chunkhash].js",
    },
    module: {
        rules: [
            {
                test: "/.css$/",
                use: ["style-loader, css-loader"],
            },
            {
                test: /\.(png|jpe?g|gif|ico|txt)(\?]?.*)?$/,
                loader: "file-loader",
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader",
            },
        ],
    },
    devServer: {
        publicPath: "/",
        contentBase: "./dist",
        port: 9001,
        hot: true,
    },
    performance: {
        hints: false,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "app/index.html",
        }),
        new CopyWebpackPlugin({
            patterns: patterns,
        }),
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatters: ["./dist/*"],
        }),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
        }),
    ],
});
