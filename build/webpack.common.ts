import { AureliaPlugin } from 'aurelia-webpack-plugin';
import * as CleanWebpackPlugin from 'clean-webpack-plugin';
import * as CopyWebpackPlugin from 'copy-webpack-plugin';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as path from 'path';
import * as webpack from 'webpack';
import * as merge from 'webpack-merge';
import * as Stylish from 'webpack-stylish';

export const outDir = 'dist';

const commonConfig: webpack.Configuration = {
  stats: 'none',
  output: {
    path: path.resolve(__dirname, '..', outDir),
    filename: '[name].js',
    libraryTarget: 'commonjs2'
  },

  resolve: {
    extensions: ['.ts', '.js'],
    modules: ['src', 'node_modules'].map(x => path.resolve(x))
  },

  module: {
    rules: [
      {
        test: /\.sass$/i,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      { test: /\.ts$/i, use: 'awesome-typescript-loader' },
      { test: /\.html$/i, use: 'html-loader' },
      {
        // Includes .node binaries in the output
        test: /\.node$/,
        loader: 'awesome-node-loader'
      },
      {
        // Ensures our output sourcemap includes sourcemaps from dependencies
        test: /\.js$/,
        use: 'source-map-loader',
        enforce: 'pre',
        exclude: [/reflect-metadata/]
      }
    ]
  },

  plugins: [
    new Stylish(),
    new webpack.EnvironmentPlugin({
      DEBUG: process.env.npm_lifecycle_event.startsWith('dev')
    }),
    // The 'bindings' library finds native binaries dynamically which is
    // incompatible with webpack. This replaces 'bindings' with a file
    // which has static paths
    new webpack.NormalModuleReplacementPlugin(/^bindings$/, require.resolve('./bindings'))
  ],

  node: {
    __dirname: false,
    __filename: false
  }
};

export const renderer = merge.smart({}, commonConfig, {
  name: 'renderer',
  entry: { renderer: path.resolve(__dirname, '../src/renderer') },
  target: 'electron-renderer',

  optimization: {
    // Aurelia doesn't like this enabled
    concatenateModules: false
  },

  plugins: [
    new AureliaPlugin({ aureliaApp: undefined }),
    new HtmlWebpackPlugin({
      title: require('../package.json').productName
    })
  ]
});

export const main = merge.smart({}, commonConfig, {
  name: 'main',
  entry: { main: path.resolve(__dirname, '../src/main') },
  target: 'electron-main',
  // Ensure the package.json ends up in the output directory so Electron can be
  // run straight on the output
  plugins: [
    new CleanWebpackPlugin([outDir], {
      root: path.resolve(__dirname, '..'),
      verbose: false
    }),
    new CopyWebpackPlugin(['package.json'])
  ]
});
