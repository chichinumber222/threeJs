const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/index.ts',
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/'
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: 'ts-loader'
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
    devtool: 'source-map',
    devServer: {
      static: path.join(__dirname, 'dist'),
      hot: true,
      open: true
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html', // Указывает на исходный HTML-файл
        filename: 'index.html'         // Название выходного HTML-файла
      })
    ]
  };