import { commonPlugins, createCommonPluginsWithClean } from '../../rollup.base.mjs';
import { createRequire } from 'module';
import copy from 'rollup-plugin-copy';

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
  'node:child_process',
];

const config = [
  // 主入口文件 (CLI) - 带清理功能
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'esm',
      sourcemap: true,
    },
    external,
    plugins: [
      ...createCommonPluginsWithClean(),
      copy({
        targets: [{ src: 'src/package', dest: 'dist' }],
      }),
    ],
  },
  // ESM 模块文件
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    external,
    plugins: commonPlugins,
  },
];

export default config;
