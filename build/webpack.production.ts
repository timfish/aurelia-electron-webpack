import * as CleanWebpackPlugin from 'clean-webpack-plugin';
import * as path from 'path';
import * as webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import * as merge from 'webpack-merge';
import * as common from './webpack.common';

const config: webpack.Configuration = {
  mode: 'production',
  devtool: 'source-map'
};

const main = merge({}, common.main, config);
const renderer = merge({}, common.renderer, config, {
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },

  plugins: [
    new CleanWebpackPlugin([common.outDir], { verbose: false }),
    new BundleAnalyzerPlugin({
      reportFilename: path.join(__dirname, 'bundle-report.html'),
      analyzerMode: 'static',
      openAnalyzer: false
    })
  ]
});

export = [main, renderer];
