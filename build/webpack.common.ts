// tslint:disable:no-implicit-dependencies
// tslint:disable:object-literal-sort-keys
import { AureliaPlugin } from 'aurelia-webpack-plugin';
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
        enforce: 'pre'
      }
    ]
  },

  plugins: [
    new Stylish(),
    // The 'bindings' library finds native binaries dynamically which is
    // incompatible with webpack. This replaces 'bindings' with a file
    // which has static paths
    new webpack.NormalModuleReplacementPlugin(/^bindings$/, require.resolve('./bindings')),
    new webpack.NoEmitOnErrorsPlugin()
  ],

  node: {
    __dirname: false,
    __filename: false
  }
};

export const renderer = merge({}, commonConfig, {
  name: 'renderer',
  entry: { renderer: path.resolve(__dirname, '..', 'src/renderer') },
  target: 'electron-renderer',

  optimization: {
    // Aurelia doesn't like this enabled
    concatenateModules: false
  },

  plugins: [
    new AureliaPlugin({ aureliaApp: undefined }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '..', 'src', 'empty-page.html')
    })
  ]
});

export const main = merge({}, commonConfig, {
  name: 'main',
  entry: { main: path.resolve(__dirname, '..', 'src/main') },
  target: 'electron-main',
  // Ensure the package.json ends up in the output directory so Electron can be
  // run straight on the output
  plugins: [new CopyWebpackPlugin(['package.json'])]
});
