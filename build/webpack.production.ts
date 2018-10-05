import * as path from 'path';
import * as webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import * as merge from 'webpack-merge';
import * as common from './webpack.common';

const config: webpack.Configuration = {
  mode: 'production',
  devtool: 'source-map',

  plugins: [new webpack.NoEmitOnErrorsPlugin()]
};

const main = merge.smart({}, common.main, config);
const renderer = merge.smart({}, common.renderer, config, {
  plugins: [
    new BundleAnalyzerPlugin({
      reportFilename: path.join(__dirname, 'bundle-report.html'),
      analyzerMode: 'static',
      openAnalyzer: false
    })
  ]
});

export = [main, renderer];
