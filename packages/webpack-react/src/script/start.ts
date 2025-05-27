// 设置环境变量
process.env['NODE_ENV'] = 'development';

import '../utils/env';

import {
  kleur,
  getIPAddress,
  resolveApp,
  clearConsole,
  formatWebpackMessages,
  friendlyPrints,
} from '@verve-kit/utils';
import WebpackDevServer from 'webpack-dev-server';
import webpack, { Stats } from 'webpack';
import portFinder from 'portfinder';

// 检测当前是否为交互式终端
const isInteractive = process.stdout.isTTY;

let isFirstCompile = true;

// 组装 devServerConfig
const host = process.env['HOST'] || '0.0.0.0';
const sockHost = process.env['WDS_SOCKET_HOST'];
const sockPath = process.env['WDS_SOCKET_PATH'];
const sockPort = process.env['WDS_SOCKET_PORT'];

const devServerConfig: WebpackDevServer.Configuration = {
  host,
  hot: true,
  compress: true,
  historyApiFallback: true,

  client: {
    webSocketURL: {
      hostname: sockHost,
      pathname: sockPath,
      port: sockPort,
    },
    logging: 'info',
    overlay: {
      errors: true,
      warnings: false,
    },
  },
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Headers': '*',
  },
  static: {
    watch: {
      ignored: resolveApp('src'),
    },
  },
};

async function startDevServer() {
  // 动态导入 webpack 配置
  const devWebpackConfig = await import('../config/webpack.dev.js').then((m) => m.default);

  // 用户自定义端口（优先级最高），默认端口 3000
  const userPort = devWebpackConfig?.devServer?.port;

  // 查找可用端口并启动服务
  portFinder.getPort(
    {
      port: (userPort as number) || Number(process.env['PORT']) || 3000,
      stopPort: 9999,
    },
    (err: Error | null, port: number) => {
      if (err) {
        console.error(kleur.red(`Error finding port: ${err.message}`));
        process.exit(1);
      }

      console.log(kleur.blue(`Port selected: ${port}`));

      devServerConfig.port = port;
      devServerConfig.open = `http://localhost:${port}`;

      // 删除用户自定义端口配置，避免与动态端口冲突
      if (userPort && devWebpackConfig.devServer) {
        delete devWebpackConfig.devServer.port;
      }

      // 创建 webpack 编译器
      const compiler = webpack(devWebpackConfig);

      // 创建 devServer 实例
      const server = new WebpackDevServer(
        { ...devServerConfig, ...devWebpackConfig.devServer },
        compiler,
      );

      // 监听编译完成
      compiler.hooks.done.tap('done', (stats: Stats) => {
        if (isInteractive) clearConsole();

        const statsData = stats.toJson({
          all: false,
          warnings: true,
          errors: true,
        }) as webpack.StatsCompilation & { errors: any[]; warnings: any[] };

        const messages = formatWebpackMessages(statsData);
        const isSuccessful = messages.errors.length === 0 && messages.warnings.length === 0;

        if (isSuccessful) {
          console.log(kleur.green('Compiled successfully!'));
        }

        if (isSuccessful && (isInteractive || isFirstCompile)) {
          friendlyPrints({
            localUrlForTerminal: `http://localhost:${port}`,
            lanUrlForTerminal: `http://${getIPAddress()}:${port}`,
          });
        }

        isFirstCompile = false;

        if (messages.errors.length) {
          if (messages.errors.length > 1) {
            messages.errors.length = 1;
          }

          console.log(kleur.red('Failed to compile.\n'));
          console.log(messages.errors.join('\n\n'));

          return;
        }

        if (messages.warnings.length) {
          console.log(kleur.yellow('Compiled with warnings.\n'));
          console.log(messages.warnings.join('\n\n'));
          console.log(
            '\nSearch for the ' +
              kleur.underline(kleur.yellow('keywords')) +
              ' to learn more about each warning.',
          );
          console.log(
            'To ignore, add ' +
              kleur.cyan('// eslint-disable-next-line') +
              ' to the line before.\n',
          );
        }
      });

      // 监听文件变动时重新编译
      compiler.hooks.invalid.tap('invalid', () => {
        if (isInteractive) clearConsole();
        console.log('Compiling...');
      });

      // 启动 dev server
      server.startCallback(() => {
        console.log(kleur.green(`Dev server is running on http://localhost:${port}`));
      });
    },
  );
}

// 启动开发服务器
startDevServer().catch((error) => {
  console.error(kleur.red('Failed to start dev server:'), error);
  process.exit(1);
});
