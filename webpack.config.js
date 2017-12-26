var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: "./src/othering-machine.js",
  output: {
    filename: 'sketch.js',
    path: path.join(__dirname, 'dist'),
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_module/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.scss$/,
        loader: "style-loader!css-loader!sass-loader"
      },
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
      },
      {
        test: /.*\.(gif|png|jpe?g|svg)$/i,
        loaders: [
          'file-loader',
          {
            loader: 'image-webpack-loader',
            query: {
              mozjpeg: {
                progressive: true,
              },
              gifsicle: {
                interlaced: false,
              },
              optipng: {
                optimizationLevel: 4,
              },
              pngquant: {
                quality: '75-90',
                speed: 3,
              },
            }
          }
        ]
      },
      {
        test: /\.mp3$/,
        loader: 'file-loader'
      },
      {
        test: /\.mp4$/,
        loader: 'file-loader'
      },
      {
        test: /\.mov/,
        loader: 'file-loader'
      },
      {
        test: /\.json/,
        loader: 'file-loader'
      }
    ]
  },
  devServer: {
    inline: true,
    contentBase: './dist',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html"
    }),
  ]
};
