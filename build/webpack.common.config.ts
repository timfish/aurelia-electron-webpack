import { AureliaPlugin } from 'aurelia-webpack-plugin';
import * as CleanWebpackPlugin from 'clean-webpack-plugin';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import { resolve } from 'path';
import * as TerserPlugin from 'terser-webpack-plugin';
import * as webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import * as merge from 'webpack-merge';
import * as WriteFilePlugin from 'write-file-webpack-plugin';
import { CopyPkgJsonAndRemoveKeys, ElectronProcessPlugin } from './webpack-plugins';

const isDevServer = process.argv.some(v => v.includes('webpack-dev-server'));
const appRoot = process.cwd();

function getBundleAnalyzerPlugin(entryPoints: webpack.Entry): BundleAnalyzerPlugin {
  return new BundleAnalyzerPlugin({
    reportFilename: `bundle-report-${Object.keys(entryPoints)[0]}.html`,
    analyzerMode: 'static',
    openAnalyzer: false
  });
}

function when(condition: boolean, ...whenTrue: webpack.Plugin[]): webpack.Plugin[] {
  return condition ? whenTrue : [];
}

const commonConfig: ({ production }) => webpack.Configuration = (
  { production } = { production: false }
) => ({
  mode: production ? 'production' : 'development',
  devtool: production ? 'source-map' : 'inline-source-map',
  devServer: {
    disableHostCheck: true
  },
  resolve: {
    mainFields: ['module', 'main'],
    extensions: ['.ts', '.js'],
    modules: ['src', 'node_modules'].map(x => resolve(x))
  },
  output: {
    libraryTarget: 'commonjs2'
  },
  optimization: {
    minimize: production,
    concatenateModules: false,
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
        terserOptions: {
          output: {
            comments: false
          }
        }
      })
    ],
    namedModules: true
  },
  performance: { hints: false },
  module: {
    rules: [
      {
        // Relocates assets that are located dynamically at runtime and rewrites
        // their location. This is particularly helpful for node binaries
        // located via the bindings or node-pre-gyp libraries.
        test: /\.(m?js|node)$/,
        parser: { amd: false },
        use: {
          loader: '@zeit/webpack-asset-relocator-loader',
          options: {
            outputAssetBase: 'assets'
          }
        }
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
        issuer: /\.[tj]s$/i
      },
      {
        test: /\.scss$/,
        use: ['css-loader', 'sass-loader'],
        issuer: /\.html?$/i
      },
      {
        test: /\.[tj]s$/i,
        loader: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.html$/i,
        use: [
          {
            loader: 'html-loader',
            options: {
              minimize: true
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf|png|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: { name: 'assets/[name].[ext]' }
          }
        ]
      }
    ]
  },
  plugins: [
    new ElectronProcessPlugin(),
    new webpack.DefinePlugin({
      'process.env.production': JSON.stringify(production)
    })
  ],
  node: false,
  externals: ['electron']
});

export const main = (entryPoints: webpack.Entry) => ({ production } = { production: false }) =>
  merge.smart(commonConfig({ production }), {
    entry: entryPoints,
    target: 'electron-main',
    plugins: [
      new CopyPkgJsonAndRemoveKeys(),
      ...when(
        production,
        getBundleAnalyzerPlugin(entryPoints),
        new CleanWebpackPlugin(['dist'], { root: appRoot, verbose: false })
      )
    ]
  });

export const preload = (entryPoints: webpack.Entry) => ({ production } = { production: false }) =>
  merge.smart(commonConfig({ production }), {
    entry: entryPoints,
    target: 'electron-renderer',
    plugins: [...when(production, getBundleAnalyzerPlugin(entryPoints))]
  });

export const renderer = (entryPoints: webpack.Entry, nodeIntegration: boolean = true) => (
  { production } = { production: false }
) =>
  merge.smart(commonConfig({ production }), {
    entry: entryPoints,
    target: nodeIntegration ? 'electron-renderer' : 'web',
    output: {
      filename: production ? '[name].[contenthash:8].js' : '[name].[hash:8].js',
      libraryTarget: nodeIntegration ? 'commonjs2' : 'this'
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: Infinity
      }
    },
    plugins: [
      new AureliaPlugin({ aureliaApp: undefined, features: { polyfills: 'esnext' } }),
      ...when(production, getBundleAnalyzerPlugin(entryPoints)),
      ...when(isDevServer, new WriteFilePlugin()),
      // Create an HTML file for each entry point
      ...Object.keys(entryPoints).map(
        entry => new HtmlWebpackPlugin({ title: '', filename: `${entry}.html`, chunks: [entry] })
      )
    ]
  });
