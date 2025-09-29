const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: './src/index.tsx',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      src: path.resolve(__dirname, 'src'),
      styles: path.resolve(__dirname, 'styles'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({
        BACKEND_URL: process.env.BACKEND_URL || 'https://api.canva.cn/rest',
        BASE_CANVA_CONNECT_API_URL: process.env.BASE_CANVA_CONNECT_API_URL || 'https://api.canva.cn/rest',
        BASE_CANVA_CONNECT_AUTH_URL: process.env.BASE_CANVA_CONNECT_AUTH_URL || 'https://www.canva.cn/api',
        CANVA_CLIENT_ID: process.env.CANVA_CLIENT_ID || 'OC-AZbW7d5jk2-P',
        NODE_ENV: JSON.stringify('production'),
      }),
    }),
  ],
  optimization: {
    minimize: true,
  },
};
