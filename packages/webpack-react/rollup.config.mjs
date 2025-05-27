import { commonPlugins, createCommonPluginsWithClean } from '../../rollup.base.mjs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

// 为 CLI 工具创建特殊配置
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  'path',
  'fs',
  'util',
  'os',
  'node:path',
  'node:fs',
  'node:url',
  'zlib',
];

const config = [
  // 主入口文件 (带清理功能)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'esm',
      sourcemap: true,
    },
    external,
    plugins: createCommonPluginsWithClean(),
  },
  // 编译脚本文件
  {
    input: {
      'script/start': 'src/script/start.ts',
      'script/build': 'src/script/build.ts',
      'script/analyzer': 'src/script/analyzer.ts',
    },
    output: {
      dir: 'dist',
      format: 'esm',
      sourcemap: true,
    },
    external,
    plugins: commonPlugins,
  },
  // 编译配置文件
  {
    input: {
      'config/webpack.common': 'src/config/webpack.common.ts',
      'config/webpack.dev': 'src/config/webpack.dev.ts',
      'config/webpack.prod': 'src/config/webpack.prod.ts',
    },
    output: {
      dir: 'dist',
      format: 'esm',
      sourcemap: true,
    },
    external,
    plugins: commonPlugins,
  },
  // 编译工具文件
  {
    input: {
      'utils/env': 'src/utils/env.ts',
    },
    output: {
      dir: 'dist',
      format: 'esm',
      sourcemap: true,
    },
    external,
    plugins: commonPlugins,
  },
];

export default config;
