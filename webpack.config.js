const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

module.exports = {
  entry: "./flowmap.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "flowmap.js",
  },
  module: {
    rules: [
      {
        test: /\.tif$/,
        use: "file-loader",
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new WasmPackPlugin({
      crateDirectory: path.resolve(__dirname, "."),
    }),
  ],
  mode: "development",
  experiments: {
    asyncWebAssembly: true,
  },
};
