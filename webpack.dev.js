const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.config.js');
const path = require('path');

module.exports = merge(common, {
  mode: 'development',
  entry: ['babel-polyfill', path.resolve(__dirname, './src/index.js')],
  // devtool: 'inline-source-map',
  plugins: [new webpack.HotModuleReplacementPlugin()],
  module: {
    rules: [
      {
        test: /\.png|woff|woff2|eot|ttf|svg|jpg|gif|ico$/,
        loader: 'file-loader',
        options: {
          outputPath: 'kos/images',
          publicPath: 'kos/images'
        },
      }
    ]
  },
  devServer: {
    contentBase: path.resolve(__dirname, './public'),
    historyApiFallback: true,
    hot: true,
    port: 3000,
    // proxy: {
    //   '/kos-api/*': {
    //     target: 'https://app.kos.info/',
    //     secure: false,
    //     changeOrigin: true,
    //     ws: true
    //   }
    // }
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'kos/js/main.js',
    publicPath: '/',
    clean: true
  }
})