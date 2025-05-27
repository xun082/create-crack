import { commonPlugins, createCommonPluginsWithClean } from '../../rollup.base.mjs';
import { createRequire } from 'module';
import dts from 'rollup-plugin-dts';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

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
];

const config = [
  // ESM build - 带清理功能
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
  // Types build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
];

export default config;
