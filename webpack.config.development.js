const baseConfig = require('./webpack.config.base');

const config = Object.create(baseConfig);

config.mode = 'development';

module.exports = config;
