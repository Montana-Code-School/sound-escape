const webpack = require('webpack')
const {resolve} = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: {
   app: './index.js'
  },
  context: resolve(__dirname, 'src'),
  mode: 'development',
  output: {
    filename: '[name].main.js',
    path: resolve(__dirname, 'dist')
  },
  devtool: 'inline-src-map',
  devServer: {
    hot: true,
    publicPath: '/',
    historyApiFallback: true
  },
  plugins: [
    new webpack.ProvidePlugin({
      THREE: 'three',
      CANNON: 'cannon'
    }),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      template: resolve(__dirname, 'src/index.html'),
    })
  ]
};