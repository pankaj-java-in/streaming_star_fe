const { merge } = require('webpack-merge');
const common = require('./webpack.config.js');
const path = require('path');


module.exports = env => {
  let baseUrl = 'https://app.kos.info/';
  // if (env.dev){
  //   baseUrl = 'https://ms.oodleslab.com/chat/';
  // }else if (env.stage){
  //   baseUrl = 'https://stage.oodleslab.com/chat/';
  // }else if (env.prod){
  //   baseUrl = 'https://my.oodles.io/chat/';
  // }

  return merge(common, {
    mode: 'production',
    entry: ['babel-polyfill', path.resolve(__dirname, './src/index.js')],
    module: {
      rules: [
        {
          test: /\.png|woff|woff2|eot|ttf|svg|jpg|gif|ico$/,
          loader: 'file-loader',
          options: {
            outputPath: 'kos/images',
            publicPath: "https://stage.oodlestech.in/fe/" + 'kos/images',
          },
        }
      ]
    },
    output: {
      path: path.resolve(__dirname, './dist/'),
      filename: 'kos/js/main.js',
      publicPath: "https://stage.oodlestech.in/fe/",
      clean: true
    },
    stats: {
      logging: true,
      errors: true,
      errorDetails: true,
      timings: true
    }
  })
};