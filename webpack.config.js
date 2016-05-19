module.exports = {
  entry: "./static/Main.js",
  output: {
    path: __dirname,
    filename: "./static/bundle.js"
  },
  watch: true,
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  }
};