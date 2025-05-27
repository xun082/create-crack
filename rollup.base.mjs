import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import swc from '@rollup/plugin-swc';
import json from '@rollup/plugin-json';
import dts from 'rollup-plugin-dts';
import del from 'rollup-plugin-delete';

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

export function createConfig(pkg, input = 'src/index.ts') {
  const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    'path',
    'fs',
    'util',
    'os',
  ];

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
