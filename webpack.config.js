import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
  mode: 'production',
  entry: {
    'content/content': './src/content/index.js',
    'popup/translator': './src/popup/translator.js',
    'popup/popup': './src/popup/popup.js',
    'popup/settings': './src/popup/settings.js',
    'popup/prompt': './src/popup/prompt.js',
    'popup/storyteller': './src/popup/storyteller.js'
  },
  output: {
    path: path.resolve('dist'),
    filename: '[name].js'  // Creates separate folders for each entry

  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        // use: 'babel-loader' // Optional: if you need Babel for ES6 support
      }
    ]
  },
  plugins: [
    // Process HTML files for popup and options pages
		/*
    new HtmlWebpackPlugin({
      filename: 'popup/popup.html',
      template: './src/popup/popup.html',
      chunks: ['popup']
    }),
    new HtmlWebpackPlugin({
      filename: 'options/options.html',
      template: './src/options/options.html',
      chunks: ['options']
    }),
		*/
    // Copy static assets like manifest.json and icons
    new CopyPlugin({
      patterns: [
				{ from: 'src/popup', to: 'popup' },
				{ from: 'src/icons', to: 'icons' },
        { from: 'src/manifest.json', to: 'manifest.json' },
				{ from: 'src/background', to: 'background' },
				{ from: 'src/popup/css/index.css', to: 'css/index.css' },
        { from: 'src/icons/right-arrow.png', to: 'icons/right-arrow.png' }
      ]
    })
  ],
  resolve: {
    extensions: ['.js']
  }
};
