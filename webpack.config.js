const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');

// Load environment variables from .env file
const env = dotenv.config().parsed;

const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});

module.exports = {
  // The entry point for your application
  entry: './src/index.js',

  // Output configuration
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },

  // Module configuration (rules, loaders, etc.)
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },

  // Plugins
  plugins: [
    // Plugin to define environment variables using DefinePlugin
    new webpack.DefinePlugin(envKeys),
  ],

  // Set mode to development or production
  mode: process.env.NODE_ENV || 'development',

  // Optional: Dev server configuration for live reloading
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 3000,
    open: true, // Open the browser when the server starts
  },

  // Resolve extensions (optional)
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
