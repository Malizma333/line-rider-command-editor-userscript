/* eslint-disable no-undef */
module.exports = {
  mode: "production",
  entry: ['./src/index.ts', './src/globalHacks/gravity.js'],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'command-editor.min.js',
    path: __dirname
  },
};