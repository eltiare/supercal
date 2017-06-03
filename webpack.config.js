let path = require('path');
let webpack = require('webpack');
let BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let nodeExternals = require('webpack-node-externals');

let env = process.env.NODE_ENV || 'dev';
let prod = env === 'production';

let plugins = [
  //new webpack.optimize.UglifyJsPlugin({ sourceMap: !prod }),
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.optimize.AggressiveMergingPlugin(), //Merge chunks
  new ExtractTextPlugin("[name]"),
  new webpack.DefinePlugin({
    __PROD: prod,
    __DEV: env === 'dev'
  }),
  new BundleAnalyzerPlugin({
    analyzerMode: 'server',
    analyzerHost: '127.0.0.1',
    analyzerPort: 8888
  })
];

let config = {
  devtool: prod ? false : 'source-map',
  entry: {
    "index.js":           "./src/js/supercal.js",
    "supercal.css":       "./src/css/supercal.scss"
  },
  output: {
    library: 'Supercal',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    path: path.resolve(__dirname, 'lib'),
    filename: '[name]'
  },
  externals: prod ? [ nodeExternals() ] : [],
  plugins: plugins,
  resolve: {
    alias: {
      'react': 'preact-compat',
      'react-dom': 'preact-compat'
    }
  },
  module: {
    loaders: [
      {
        test: /\.(s)?css$/,
        loader: ExtractTextPlugin.extract({
              fallback: "style-loader",
              loader: "css-loader!resolve-url-loader!sass-loader?sourceMap"
            })
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        query: {
          presets: [
            [ 'es2015', { modules: false } ],
            [ "env", {
              "targets" : {
                "browsers" : ["last 3 versions", "ie >= 9"]
              }
            }],
            'react',
            'stage-0'
          ],
          plugins: [
            "transform-export-extensions",
            [ "module-resolver", {
                "root": ["."],
                "alias": {
                  "react": "preact-compat",
                  "react-dom": "preact-compat",
                  "create-react-class": "preact-compat/lib/create-react-class"
                }
              }
            ]
          ]
        },
        exclude: path.resolve(__dirname, 'node_modules')
      }
    ]
  }
};

if (!prod) {
  Object.assign(config.entry, {
    "manual-test.js": "./src/js/manual-test.js",
    "arise.css": "react-arise/lib/arise.css"
  });
}

module.exports = config;
