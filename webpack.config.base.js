var webpack = require('webpack');

module.exports = {
  output: {
    library: 'ReduxSounds',
    libraryTarget: 'umd'
  },

  module: {
    loaders: [
      {
        test:     /\.js$/,
        loader:   'babel',
        exclude:  /node_modules/,
        include:  /src/
      }
    ]
  },

  resolve: {
    extensions: ['', '.js']
  }
}
