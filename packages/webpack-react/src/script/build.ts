process.env['NODE_ENV'] = 'production';

import webpack from 'webpack';

async function build() {
  try {
    const prodWebpackConfig = await import('../config/webpack.prod.js').then((m) => m.default);

    webpack(prodWebpackConfig, (err) => {
      if (err) console.log(err);
    });
  } catch (error) {
    console.error('Failed to build:', error);
    process.exit(1);
  }
}

build();
