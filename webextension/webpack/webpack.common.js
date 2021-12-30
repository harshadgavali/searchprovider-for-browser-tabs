const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const srcDir = path.join(__dirname, "..", "src");

module.exports = {
    entry: {
        chromium: { import: path.join(srcDir, 'background.ts'), filename: 'chromium/background.js' },
        firefox: { import: path.join(srcDir, 'background.ts'), filename: 'firefox/background.js' }
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "./", to: "../dist/firefox", context: "public/firefox" },
                { from: "./", to: "../dist/chromium", context: "public/chromium" }
            ],
            options: {},
        }),
    ],
}