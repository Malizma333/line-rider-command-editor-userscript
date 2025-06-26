/* eslint-disable no-undef */
module.exports = {
  mode: "production",
  entry: ["./src/index.ts"],
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
    filename: "command-editor.min.js",
    path: __dirname,
  },
  watch: true,
};
