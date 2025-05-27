import { existsSync } from 'node:fs';

import { resolveApp } from './resolveApp';

/**
 * 判断当前项目是否启用了 TypeScript（即是否存在 tsconfig.json）。
 *
 * @remarks
 * 该判断依据是项目根目录下是否存在 `tsconfig.json` 文件。
 *
 * @returns `true` 表示项目使用 TypeScript，`false` 表示未使用。
 *
 * @example
 * ```ts
 * if (isUseTypescript) {
 *   console.log('TypeScript is enabled!');
 * }
 * ```
 */
const isUseTypescript = existsSync(resolveApp('tsconfig.json'));

export { isUseTypescript };
