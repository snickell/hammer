var WebpackNotifierPlugin = require('webpack-notifier');
var webpack = require('webpack');
const path = require("path");


module.exports = {
    entry: {
        "index": "./src/index.js",
        
    },
    output: {
        path: path.resolve(__dirname, ""),
        filename: "build/[name].js"
    },
    devtool: "eval",
    module: {
      loaders: [
        {
          test: /.jsx?$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          query: {
            presets: ['env', 'react'],
            plugins: [require('babel-plugin-transform-object-rest-spread')]            
          }
        },
        {
          test: /.js?$/,
          loader: 'babel-loader',     
          exclude: /node_modules/,
          query: {
            presets: ['env'],
            plugins: [require('babel-plugin-transform-object-rest-spread')]            
          }
        },
        {
          test: /\.html$/,
          loader: "raw-loader"
        }     
      ]
    },
    plugins: [     
      new WebpackNotifierPlugin({
        contentImage: path.join(__dirname, 'icons/vr-48.png'),
        alwaysNotify: true
      }),
    ],    
};
