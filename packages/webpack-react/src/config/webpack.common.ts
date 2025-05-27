import { createRequire } from 'node:module';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack, { type Configuration } from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { merge } from 'webpack-merge';
import { resolveApp, isUseTypescript, createEnvironmentHash, useCssPreset } from '@verve-kit/utils';

import getClientEnvironment from '../utils/env.js';
import { createConfigLoader } from '../utils/config-loader.js';

const { DefinePlugin } = webpack;

// 创建 require 函数用于解析模块路径
const require = createRequire(import.meta.url);

// 判断环境
const isDevelopment = process.env['NODE_ENV'] === 'development';
const env = getClientEnvironment();

// 创建配置加载器实例
const configLoader = createConfigLoader({ enableCache: !isDevelopment });

// 基础配置
const baseConfig: Configuration = {
  stats: 'errors-warnings',
  entry: resolveApp(isUseTypescript ? './src/index.tsx' : './src/index.jsx'),
  output: {
    ...(isDevelopment ? {} : { path: resolveApp('./dist') }),
    assetModuleFilename: 'assets/[hash][ext][query]',
    filename: isDevelopment
      ? 'static/js/[name].bundle.js'
      : 'static/js/[name].[contenthash:8].bundle.js',
    chunkFilename: isDevelopment
      ? 'static/js/[name].chunk.js'
      : 'static/js/[name].[contenthash:8].chunk.js',
    clean: true,
    pathinfo: false,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.scss$|\.less$/i,
        include: [resolveApp('./src')],
        exclude: /node_modules/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: isDevelopment,
              modules: {
                mode: 'local',
                auto: true,
                exportGlobals: true,
                localIdentName: isDevelopment
                  ? '[path][name]__[local]--[hash:base64:5]'
                  : '[local]--[hash:base64:5]',
                localIdentContext: resolveApp('./src'),
                exportLocalsConvention: 'camelCase',
              },
              importLoaders: 2,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: ['autoprefixer'],
              },
            },
          },
          useCssPreset('sass') && 'sass-loader',
          useCssPreset('less') && 'less-loader',
        ].filter(Boolean),
      },
      {
        test: /\.(jpe?g|png|gif|webp|svg|mp4)$/,
        type: 'asset',
        generator: {
          filename: './images/[hash:8][ext][query]',
        },
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024,
          },
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: './assets/fonts/[hash][ext][query]',
        },
      },
      {
        test: /\.(tsx?|jsx?)$/,
        include: [resolveApp('./src')],
        exclude: [/node_modules/, /public/, /(.|_)min\.js$/],
        use: {
          loader: require.resolve('babel-loader'),
          options: {
            babelrc: false,
            configFile: false,
            cacheDirectory: true,
            cacheCompression: false,
            presets: [
              [require.resolve('@babel/preset-react'), { runtime: 'automatic' }],
              isUseTypescript && require.resolve('@babel/preset-typescript'),
              [
                require.resolve('@babel/preset-env'),
                {
                  useBuiltIns: 'usage',
                  corejs: 3,
                  modules: false,
                },
              ],
            ].filter(Boolean),
            plugins: [
              isDevelopment && require.resolve('react-refresh/babel'),
              require.resolve('@babel/plugin-transform-runtime'),
              require.resolve('@babel/plugin-syntax-dynamic-import'),
            ].filter(Boolean),
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@pages': resolveApp('src/pages'),
      '@': resolveApp('src'),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: resolveApp('./public/index.html'),
      filename: 'index.html',
      title: 'moment',
      inject: true,
      hash: true,
      minify: isDevelopment
        ? false
        : {
            removeComments: true,
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true,
            caseSensitive: true,
            removeRedundantAttributes: true,
            removeEmptyAttributes: true,
            removeStyleLinkTypeAttributes: true,
            removeScriptTypeAttributes: true,
            useShortDoctype: true,
          },
    }),
    new DefinePlugin({
      BASE_URL: '"./"',
      ...env.stringified,
    }),
    !isDevelopment &&
      new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash:8].css',
        chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
      }),
  ].filter(Boolean),
  cache: {
    type: 'filesystem',
    version: createEnvironmentHash(
      Object.fromEntries(
        Object.entries(env.raw).filter(([, value]) => value !== undefined),
      ) as Record<string, string>,
    ),
    store: 'pack',
    cacheDirectory: resolveApp('node_modules/.cache'),
  },
  infrastructureLogging: {
    level: 'none',
  },
};

/**
 * ⚡️ 创建最终的 Webpack 配置
 * 优雅地合并基础配置和用户自定义配置
 */
export default async (): Promise<Configuration> => {
  try {
    const userConfig = await configLoader.load({
      mode: process.env['NODE_ENV'],
      isDevelopment,
      env: env.raw,
    });

    if (!userConfig) {
      if (isDevelopment) {
        console.log('📦 Using default webpack configuration');
      }

      return baseConfig;
    }

    // 使用 webpack-merge 智能合并配置
    const mergedConfig = merge(baseConfig, userConfig);

    if (isDevelopment) {
      console.log('🔧 Merged user webpack configuration');
    }

    return mergedConfig;
  } catch (error) {
    console.error('❌ Failed to load webpack configuration:', error);
    console.log('📦 Falling back to default configuration');

    return baseConfig;
  }
};
