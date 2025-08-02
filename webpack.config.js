const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

module.exports = {
  entry: "./flowmap.ts",
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
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: "/node_modules/",
      },
    ],
  },

  devtool: "inline-source-map",
  plugins: [
    new HtmlWebpackPlugin({
      title: "Wasm Landscape",
      filename: "index.html",
      template: "./flowmap.html",
      inject: "body",
    }),
    new WasmPackPlugin({
      crateDirectory: path.resolve(__dirname, "."),
    }),
  ],
  devServer: {
    static: "./dist",
  },
  mode: "production",
  experiments: {
    asyncWebAssembly: true,
  },
};
