const webpack = require('webpack');
const baseConfig = require('./webpack.config.base');

const config = Object.create(baseConfig);

config.plugins = [
  new webpack.LoaderOptionsPlugin({
    minimize: true
  })
];

config.mode = 'production';

module.exports = config;
