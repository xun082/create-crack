import { merge } from 'webpack-merge';
import CircularDependencyPlugin from 'circular-dependency-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import { isUseTypescript } from '@verve-kit/utils';
import { type Configuration } from 'webpack';

export default (async (): Promise<Configuration> => {
  const { default: getCommonConfig } = await import('./webpack.common.js');
  const commonConfig = await getCommonConfig();

  return merge(commonConfig, {
    mode: 'development',
    devtool: 'inline-source-map',
    plugins: [
      new ReactRefreshWebpackPlugin({
        overlay: false,
      }),
      isUseTypescript &&
        new ForkTsCheckerWebpackPlugin({
          async: false,
        }),
      new CircularDependencyPlugin({
        exclude: /node_modules/,
        include: /src/,
        failOnError: true,
        allowAsyncCycles: false,
        cwd: process.cwd(),
      }),
    ].filter(Boolean),
    optimization: {
      splitChunks: {
        chunks: 'all',
      },
      runtimeChunk: {
        name: 'runtime',
      },
    },
    cache: {
      type: 'filesystem',
    },
  });
})();
