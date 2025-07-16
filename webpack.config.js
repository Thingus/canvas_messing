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
  devtool: "inline-source-map",
  plugins: [
    new HtmlWebpackPlugin({
      title: "Wasm Landscape",
      filename: "index.html",
      template: "./flowmap.html",
    }),
    new WasmPackPlugin({
      crateDirectory: path.resolve(__dirname, "."),
    }),
  ],
  devServer: {
    static: "./dist",
  },
  mode: "development",
  experiments: {
    asyncWebAssembly: true,
  },
};
