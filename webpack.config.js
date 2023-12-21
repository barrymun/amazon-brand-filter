const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = (env, argv) => {
  return {
    mode: argv.mode === "development" ? "development" : "production",
    devtool: argv.mode === "development" ? "cheap-module-source-map" : "source-map",
    entry: {
      background: "./src/background/index.ts",
      content: "./src/content/index.ts",
      popup: "./src/popup/index.ts",
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
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "dist"),
    },
    plugins: [
      new CleanWebpackPlugin(),
      new CopyPlugin({
        patterns: [
          { from: "manifest.json", to: "./" },
          { from: "src/icons", to: "icons" },
        ],
      }),
    ],
  };
};
