const path = require("path");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const publicFolder = path.resolve(__dirname, "public");

const isProduction = process.env.NODE_ENV === "production";

const plugins = [
  new MiniCssExtractPlugin({ 
    filename: "css/[name].[contenthash].css",
    chunkFilename: "css/[name].[contenthash].css"
  }),
  new ForkTsCheckerWebpackPlugin({ checkSyntacticErrors: true }),
  new BundleAnalyzerPlugin({
    analyzerMode: "disabled", // To visualize the treemap of dependencies, change "disabled" to "static" and remove statsOptions
    generateStatsFile: true,
    statsFilename: "assets.json",
    statsOptions: {
      assets: false,
      children: false,
      chunks: false,
      entrypoints: true,
      chunkGroups: false,
      modules: false
    }
  })
];

if (!isProduction) {
  const CleanObsoleteChunks = require("webpack-clean-obsolete-chunks");
  plugins.push(new CleanObsoleteChunks());
}

// On Development Mode, we allow Assets to be up to 10 times bigger than on Prodution Mode
const maxSizeFactor = isProduction ? 1 : 10;

module.exports = {
  mode: process.env.NODE_ENV || "development",
  entry: {
    main: "./public/index.tsx",
    vendor: [ 
      "react", 
      "react-dom", 
      "tslib", 
      "markdown-it",
      "react-textarea-autosize", 
      "react-toastify", 
      "react-loadable", 
      "react-icons/lib" 
    ],
    vendorCSS: [ 
      "react-toastify/dist/ReactToastify.css" 
    ],
  },
  output: {
    path: __dirname + "/dist",
    filename: "js/[name].[contenthash].js",
    publicPath: "/assets/",
  },
  devtool: "source-map",
  resolve: {
    extensions: [".mjs", ".ts", ".tsx", ".js"],
    alias: {
      "@fider": publicFolder
    }
  },
  performance: {
    maxEntrypointSize: 389120 * maxSizeFactor, // 380 KiB. Should ideally be ~240 KiB
    maxAssetSize: 256000 * maxSizeFactor, // 250 KiB
    hints: "error"
  },
  module: {
    rules: [
      { 
        test: /\.(css|scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader"                  
        ]
      },
      { 
        test: /\.(ts|tsx)$/,
        include: publicFolder,
        loader: "ts-loader",
        options: {
          transpileOnly: true
        }
      }
    ]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        common: {
          chunks: 'all',
          name: 'common',
          test: /[\\/]public[\\/](components|services|models)[\\/]/
        },
        vendor: {
          chunks: 'all',
          name: 'vendor',
          test: 'vendor'
        },
      }
    }
  },
  plugins,
  stats: {
    assets: true,
    children: false,
    entrypoints: false,
    modules: false,
  }
};