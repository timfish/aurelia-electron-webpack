import * as webpack from 'webpack';
import * as merge from 'webpack-merge';
import * as WriteFilePlugin from 'write-file-webpack-plugin';
import * as common from './webpack.common';

const config: webpack.Configuration = {
  mode: 'development',
  devtool: 'inline-source-map',

  optimization: {
    minimize: false
  }
};

const main = merge.smart({}, common.main, config);

const renderer = merge.smart({}, common.renderer, config, {
  output: {
    publicPath: 'http://localhost:8080/dist/'
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    // This ensures that index.html gets written to
    // the output in development mode
    new WriteFilePlugin()
  ]
});

export = [main, renderer];
