import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import swc from '@rollup/plugin-swc';
import json from '@rollup/plugin-json';
import dts from 'rollup-plugin-dts';
import del from 'rollup-plugin-delete';
import { createRequire } from 'module';

// Common SWC options
export const swcOptions = {
  jsc: {
    parser: {
      syntax: 'typescript',
      tsx: false,
      decorators: false,
    },
    target: 'es2021',
  },
  sourceMaps: true,
};

// Common plugins (without clean)
export const commonPlugins = [
  resolve({
    preferBuiltins: true,
    extensions: ['.ts', '.js', '.json'],
  }),
  commonjs(),
  json(),
  swc(swcOptions),
];

// Clean plugin factory
export const createCleanPlugin = (targets = 'dist/*') => del({ targets });

// Common plugins with clean
export const createCommonPluginsWithClean = (targets = 'dist/*') => [
  createCleanPlugin(targets),
  ...commonPlugins,
];

// 创建通用的external数组
export function createExternal(pkg, additionalModules = []) {
  return [
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
    ...additionalModules,
  ];
}

// 加载package.json的通用函数
export function loadPackageJson(importMetaUrl) {
  const require = createRequire(importMetaUrl);
  return require('./package.json');
}

// 创建标准库配置（单入口 + 类型声明）
export function createLibraryConfig(importMetaUrl, options = {}) {
  const pkg = loadPackageJson(importMetaUrl);
  const { input = 'src/index.ts', additionalExternals = [], copyPlugin = null } = options;

  const external = createExternal(pkg, additionalExternals);
  const plugins = copyPlugin
    ? [...createCommonPluginsWithClean(), copyPlugin]
    : createCommonPluginsWithClean();

  return [
    // ESM build
    {
      input,
      output: {
        file: pkg.module || 'dist/index.js',
        format: 'esm',
        sourcemap: true,
      },
      external,
      plugins,
    },
    // Types build
    {
      input,
      output: {
        file: 'dist/index.d.ts',
        format: 'es',
      },
      plugins: [dts()],
    },
  ];
}

// 创建多入口配置
export function createMultiEntryConfig(importMetaUrl, entries, additionalExternals = []) {
  const pkg = loadPackageJson(importMetaUrl);
  const external = createExternal(pkg, additionalExternals);

  return entries.map((entry, index) => ({
    input: entry.input,
    output: {
      ...entry.output,
      format: 'esm',
      sourcemap: true,
    },
    external,
    plugins: index === 0 ? createCommonPluginsWithClean() : commonPlugins,
  }));
}

// 向后兼容的旧函数
export function createConfig(pkg, input = 'src/index.ts') {
  const external = createExternal(pkg);

  return [
    // ESM build
    {
      input,
      output: {
        file: pkg.module || 'dist/index.esm.js',
        format: 'esm',
        sourcemap: true,
      },
      external,
      plugins: createCommonPluginsWithClean(),
    },
    // Types build
    {
      input,
      output: {
        file: 'dist/index.d.ts',
        format: 'es',
      },
      plugins: [dts()],
    },
  ];
}
