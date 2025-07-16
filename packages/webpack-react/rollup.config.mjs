import { createMultiEntryConfig } from '../../rollup.base.mjs';

// 使用新的多入口配置函数
export default createMultiEntryConfig(
  import.meta.url,
  [
    // 主入口文件
    {
      input: 'src/index.ts',
      output: { file: 'dist/index.js' },
    },
    // 编译脚本文件
    {
      input: {
        'script/start': 'src/script/start.ts',
        'script/build': 'src/script/build.ts',
        'script/analyzer': 'src/script/analyzer.ts',
      },
      output: { dir: 'dist' },
    },
    // 编译配置文件
    {
      input: {
        'config/webpack.common': 'src/config/webpack.common.ts',
        'config/webpack.dev': 'src/config/webpack.dev.ts',
        'config/webpack.prod': 'src/config/webpack.prod.ts',
      },
      output: { dir: 'dist' },
    },
    // 编译工具文件
    {
      input: {
        'utils/env': 'src/utils/env.ts',
      },
      output: { dir: 'dist' },
    },
  ],
  ['zlib'],
);
