const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    index: './src/index.ts',
    index3DText: './src/index3DText.ts',
    indexHouseWithGhosts: './src/indexHouseWithGhosts.ts',
    indexTwoCamerasInMotion: './src/indexTwoCamerasInMotion.ts',
    indexShadowBaking: './src/indexShadowBaking.ts',
    indexRayCaster: './src/indexRayCaster.ts',
    indexControls: './src/indexControls.ts',
    indexGalaxy: './src/indexGalaxy.ts',
    indexPhysics: './src/indexPhysics.ts',
    indexCustomShaders: './src/indexCustomShaders.ts',
    indexWaterWithShaders: './src/indexWaterWithShaders.ts',
    indexSimpleShowroom: './src/indexSimpleShowroom.ts',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      },
      {
        test: /\.(gltf|glb|bin)$/,
        exclude: /node_modules/,
        use: 'file-loader',
      },
      {
        test: /\.glsl$/,
        exclude: /node_modules/,
        use: 'raw-loader',
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: 'asset/resource',
      },
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  devtool: 'source-map',
  devServer: {
    static: path.join(__dirname, 'dist'),
    hot: true,
    open: true,
    historyApiFallback: false,  // В MPA не нужен fallback для SPA. Настройка включает режим, при котором любой адрес в url обрабатывается как начальная страница (что и нужно для SPA, где роутинг делается на клиенте)
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      chunks: ['index']       
    }),
    new HtmlWebpackPlugin({
      template: './src/index3DText.html',
      filename: 'index3DText.html',
      chunks: ['index3DText']
    }),
    new HtmlWebpackPlugin({
      template: './src/indexHouseWithGhosts.html',
      filename: 'indexHouseWithGhosts.html',
      chunks: ['indexHouseWithGhosts']
    }),
    new HtmlWebpackPlugin({
      template: './src/indexTwoCamerasInMotion.html',
      filename: 'indexTwoCamerasInMotion.html',
      chunks: ['indexTwoCamerasInMotion']
    }),
    new HtmlWebpackPlugin({
      template: './src/indexShadowBaking.html',
      filename: 'indexShadowBaking.html',
      chunks: ['indexShadowBaking']
    }),
    new HtmlWebpackPlugin({
      template: './src/indexRayCaster.html',
      filename: 'indexRayCaster.html',
      chunks: ['indexRayCaster']
    }),
    new HtmlWebpackPlugin({
      template: './src/indexControls.html',
      filename: 'indexControls.html',
      chunks: ['indexControls']
    }),
    new HtmlWebpackPlugin({
      template: './src/indexGalaxy.html',
      filename: 'indexGalaxy.html',
      chunks: ['indexGalaxy']
    }),
    new HtmlWebpackPlugin({
      template: './src/indexPhysics.html',
      filename: 'indexPhysics.html',
      chunks: ['indexPhysics']
    }),
    new HtmlWebpackPlugin({
      template: './src/indexCustomShaders.html',
      filename: 'indexCustomShaders.html',
      chunks: ['indexCustomShaders']
    }),
    new HtmlWebpackPlugin({
      template: './src/indexWaterWithShaders.html',
      filename: 'indexWaterWithShaders.html',
      chunks: ['indexWaterWithShaders']
    }),
    new HtmlWebpackPlugin({
      template: './src/indexSimpleShowroom.html',
      filename: 'indexSimpleShowroom.html',
      chunks: ['indexSimpleShowroom']
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/static'),  // папка с изображениями
          to: path.resolve(__dirname, 'dist/static'),   // выходная директория
        },
        {
          from: path.resolve(__dirname, 'src/styles'),
          to: path.resolve(__dirname, 'dist/styles')
        }
      ],
    }),
  ],
  
}