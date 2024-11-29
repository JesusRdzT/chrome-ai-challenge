import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
  mode: 'production',
  entry: {
    content: './src/content/index.js',
    // background: './src/background/index.js',
    popup: './src/popup/popup.js',
    settings: './src/popup/settings.js'
    //options: './src/options/options.js'
  },
  output: {
    path: path.resolve('dist'),
    filename: '[name]/[name].js'  // Creates separate folders for each entry

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
				{ from: 'src/content/index.css', to: 'content/index.css' },
        { from: 'src/icons/right-arrow.png', to: 'icons/right-arrow.png' } // Ensure this line is present to copy the icon
      ]
    })
  ],
  resolve: {
    extensions: ['.js']
  }
};
