const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  target: 'node',
  mode: 'production',
  entry: './lib/main.js',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: false,
        },
        extractComments: false,
      }),
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'yabai.js',
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: '#!/usr/bin/env node',
      raw: true,
    }),
  ],
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
