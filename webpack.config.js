const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
  module.exports = {
    entry: {
        './index': './src/index.js'
        // './demo': './src/demo.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new CleanWebpackPlugin(), 
        new webpack.ProvidePlugin({
             jQuery: "jquery",
             $: "jquery"
        }),
        new HtmlWebpackPlugin({
            template: 'views/index.html'
        })
        // new HtmlWebpackPlugin({
        //     template: 'views/demo.html'
        // }),
    ],
    devServer: {
        contentBase: path.resolve(__dirname, 'dist'),
        host: 'localhost',
        port: 8090,
        open: true
    },
    module: {
        rules:[
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }
        ]
    }
  };