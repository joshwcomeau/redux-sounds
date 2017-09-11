module.exports = {
  output: {
    library: 'ReduxSounds',
    libraryTarget: 'umd'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: { loader: 'babel-loader' },
        exclude: /node_modules/,
        include: /src/
      }
    ]
  },

  resolve: {
    extensions: ['.js']
  }
};
