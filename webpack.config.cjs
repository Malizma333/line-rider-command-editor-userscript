// eslint-disable-next-line no-undef
module.exports = {
  mode: "production",
  entry: ['./src/index.ts', './src/globalHacks/gravity.js'],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'command-editor.min.js'
  },
};