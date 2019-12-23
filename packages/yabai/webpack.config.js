const path = require('path');

module.exports = {
  target: 'node',
  mode: 'production',
  entry: './lib/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'yabai.js',
  },
  module: {
    rules: [
      {
        test: /\.node$/,
        loader: 'node-loader',
      },
      {
        test: /README/,
        use: 'null-loader',
      },
      {
        test: /\.md$/,
        use: 'null-loader',
      },
      {
        test: /\.cmd$/,
        loader: 'null-loader',
      },
    ],
  },
};
