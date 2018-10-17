import { AureliaPlugin } from 'aurelia-webpack-plugin';
import * as CleanWebpackPlugin from 'clean-webpack-plugin';
import * as CopyWebpackPlugin from 'copy-webpack-plugin';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as path from 'path';
import * as webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import * as merge from 'webpack-merge';
import * as WriteFilePlugin from 'write-file-webpack-plugin';

const isDevServer = process.argv.some(v => v.includes('webpack-dev-server'));
const appRoot = process.cwd();

function when(condition: boolean, ...whenTrue: webpack.Plugin[]): webpack.Plugin[] {
  return condition ? whenTrue : [];
}

const commonConfig: ({ production }) => webpack.Configuration = (
  { production } = { production: false }
) => ({
  mode: production ? 'production' : 'development',
  devtool: production ? 'source-map' : 'inline-source-map',

  optimization: {
    minimize: production,
    // Aurelia doesn't like this enabled
    concatenateModules: false
  },

  performance: {
    hints: false
  },

  resolve: {
    extensions: ['.ts', '.js'],
    modules: ['src', 'node_modules'].map(x => path.resolve(x))
  },

  module: {
    rules: [
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
      { test: /\.ts$/i, use: 'awesome-typescript-loader' },
      { test: /\.html$/i, use: 'html-loader' },
      {
        // Includes .node binaries in the output
        test: /\.node$/,
        loader: 'awesome-node-loader',
        options: {
          name: '[name]-[hash:10].[ext]'
        }
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
    new webpack.DefinePlugin({
      'process.env.production': JSON.stringify(production)
    }),
    // The 'bindings' library finds native binaries dynamically which is
    // incompatible with webpack. This replaces 'bindings' with a file
    // which has static paths 🤷
    new webpack.NormalModuleReplacementPlugin(/^bindings$/, require.resolve('./bindings')),
    ...when(production, new CleanWebpackPlugin(['dist'], { root: appRoot, verbose: false }))
  ],

  node: {
    __dirname: false,
    __filename: false,
    process: false
  },

  externals: ['electron']
});

const main = (entryPoints: webpack.Entry) => ({ production } = { production: false }) =>
  merge.smart(commonConfig({ production }), {
    entry: entryPoints,
    target: 'electron-main',
    output: {
      libraryTarget: 'commonjs2'
    },

    plugins: [
      // Helps remove unused code by replacing process checks with static
      new webpack.DefinePlugin({
        'process.type': JSON.stringify('browser')
      }),
      ...when(
        production,
        new BundleAnalyzerPlugin({
          reportFilename: `bundle-report-${Object.keys(entryPoints)[0]}.html`,
          analyzerMode: 'static',
          openAnalyzer: false
        })
      ),
      new CopyWebpackPlugin(['package.json'])
    ]
  });

const renderer = (
  entryPoints: webpack.Entry,
  options: { nodeIntegration: boolean; outputHtml: boolean } = {
    nodeIntegration: true,
    outputHtml: true
  }
) => ({ production } = { production: false }) =>
  merge.smart(commonConfig({ production }), {
    entry: entryPoints,
    target: options.nodeIntegration ? 'electron-renderer' : 'web',
    output: {
      libraryTarget: options.nodeIntegration ? 'commonjs2' : 'this'
    },

    plugins: [
      new AureliaPlugin({
        aureliaApp: undefined,
        features: { polyfills: 'esnext' }
      }),
      // Helps remove unused code by replacing process checks with static
      new webpack.DefinePlugin({
        'process.type': JSON.stringify('renderer')
      }),
      ...when(
        production,
        new BundleAnalyzerPlugin({
          reportFilename: `bundle-report-${Object.keys(entryPoints)[0]}.html`,
          analyzerMode: 'static',
          openAnalyzer: false
        })
      ),
      ...when(isDevServer, new webpack.HotModuleReplacementPlugin(), new WriteFilePlugin()),
      ...when(
        // Optionally create an HTML file for each entry point
        options.outputHtml,
        ...Object.keys(entryPoints).map(
          entry =>
            new HtmlWebpackPlugin({
              title: '',
              filename: `${entry}.html`,
              chunks: [entry]
            })
        )
      )
    ]
  });

export = [
  main({ main: path.resolve(appRoot, 'src/main') }),
  renderer({
    renderer: path.resolve(appRoot, 'src/renderer')
    // Add multiple renderer entry points that can be opened in other windows
    // page2: path.resolve(appRoot, 'src/page2')
  })
  // Bundle for a renderer with nodeIntegration disabled
  // renderer(
  //   { renderer: path.resolve(appRoot, 'src/renderer') },
  //   { nodeIntegration: false, outputHtml: true }
  // ),
  //
  // Add an extra entry point for a preload script
  // renderer(
  //   { preload: path.resolve(appRoot, 'src/preload') },
  //   { nodeIntegration: true, outputHtml: false }
  // ),
  //
];
