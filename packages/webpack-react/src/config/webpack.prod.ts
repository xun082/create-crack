import { merge } from 'webpack-merge';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { resolveApp, getPackagePath } from '@verve-kit/utils';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
import CompressionWebpackPlugin from 'compression-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import HtmlMinimizerPlugin from 'html-minimizer-webpack-plugin';
import { gzip } from 'zlib';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { type Configuration } from 'webpack';

// 获取 React 等核心依赖的路径
const topLevelFrameworkPaths = getPackagePath(['react', 'react-dom'], '.');

// 生产环境配置
export default (async (): Promise<Configuration> => {
  const { default: getCommonConfig } = await import('./webpack.common.js');
  const webpackCommonConfig = await getCommonConfig();

  return merge(webpackCommonConfig, {
    mode: 'production',
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash].css',
        chunkFilename: 'static/css/[name].[contenthash].css',
        ignoreOrder: true,
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: resolveApp('./public'),
            to: './',
            globOptions: {
              dot: true,
              gitignore: true,
              ignore: ['**/index.html*'],
            },
          },
        ],
      }),
      new CompressionWebpackPlugin({
        filename: '[path][base].gz',
        test: /\.js$|\.json$|\.css/,
        threshold: 10240,
        minRatio: 0.8,
        algorithm: gzip,
      }),
      new WebpackManifestPlugin({
        fileName: 'asset-manifest.json',
        generate: (seed, files, entryPoints) => {
          const manifestFiles = files.reduce<Record<string, string>>((manifest, file) => {
            manifest[file.name] = file.path;

            return manifest;
          }, seed);

          const entrypointFiles =
            entryPoints['main']?.filter((fileName) => !fileName.endsWith('.map')) || [];

          return {
            files: manifestFiles,
            entryPoints: entrypointFiles,
          };
        },
      }),
    ].filter(Boolean),
    optimization: {
      chunkIds: 'named',
      moduleIds: 'deterministic',
      minimize: true,
      usedExports: true,
      minimizer: [
        new TerserPlugin({
          test: /\.(tsx?|jsx?)$/,
          include: resolveApp('./src'),
          exclude: /node_modules/,
          parallel: true,
          terserOptions: {
            toplevel: true,
            ie8: true,
            safari10: true,
            compress: {
              arguments: false,
              dead_code: true,
              pure_funcs: ['console.log'],
            },
          },
        }),
        new CssMinimizerPlugin(),
        new HtmlMinimizerPlugin(),
      ],
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 200000,
        cacheGroups: {
          vendor: {
            name: 'vendors',
            test: /[\\/]node_modules[\\/]/,
            filename: 'static/js/[id]_vendors.js',
            priority: 10,
          },
          react: {
            test(module: any) {
              const resource = module.nameForCondition && module.nameForCondition();

              return resource
                ? topLevelFrameworkPaths.some((pkgPath) => resource.startsWith(pkgPath))
                : false;
            },
            chunks: 'initial',
            filename: 'react.[contenthash].js',
            priority: 1,
            maxInitialRequests: 2,
            minChunks: 1,
          },
        },
      },
      runtimeChunk: {
        name: 'runtime',
      },
    },
  });
})();
