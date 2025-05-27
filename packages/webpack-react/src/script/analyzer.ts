process.env['NODE_ENV'] = 'production';

import webpack from 'webpack';
import { merge } from 'webpack-merge';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

async function analyze() {
  try {
    const prodWebpackConfig = await import('../config/webpack.prod.js').then((m) => m.default);

    const webpackConfig = merge(
      {
        plugins: [new BundleAnalyzerPlugin()].filter(Boolean),
      },
      prodWebpackConfig,
    );

    webpack(webpackConfig, (err) => {
      if (err) console.log(err);
    });
  } catch (error) {
    console.error('Failed to analyze:', error);
    process.exit(1);
  }
}

analyze();
