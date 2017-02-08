module.exports = {
  entry: './src/main.js',
  output: {
    path: './dist',
    publicPath: 'dist/',
    filename: 'build.js'
  },

  build: {
    assetsPublicPath: '/assets',
    assetsSubDirectory: '../src/assets'
  },

  resolve: { alias: { vue: 'vue/dist/vue.js' }},
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      },
      {
        test: /\.js$/,
        loader: 'babel!eslint',
        // make sure to exclude 3rd party code in node_modules
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader']
      },
      {
        // edit this for additional asset file types
        test: /\.(png|jpg|gif|svg)$/,
        // NOTE: Inside bundle.js
        // loader: 'url',
        // NOTE: Extra file
        loader: 'file',
        query: {
          // inline files smaller then 10kb as base64 dataURL
          limit: 5000,
          // fallback to file-loader with this naming scheme
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  // vue-loader config:
  // lint all JavaScript inside *.vue files with ESLint
  // make sure to adjust your .eslintrc
  vue: {
    loaders: {
      js: 'babel!eslint'
    }
  }
}
