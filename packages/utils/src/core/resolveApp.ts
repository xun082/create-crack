import { realpathSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * 获取当前项目的根目录的绝对路径。
 *
 * @remarks
 * 该路径会解析符号链接，确保你始终拿到真实的项目根路径。
 *
 * @example
 * ```ts
 * console.log(appDirectory); // /Users/you/project
 * ```
 */
const appDirectory = realpathSync(process.cwd());

/**
 * 基于项目根目录解析一个相对路径为绝对路径。
 *
 * @param relativePath - 相对于项目根目录的路径
 * @returns 返回解析后的绝对路径
 *
 * @example
 * ```ts
 * const fullPath = resolveApp('src/index.ts');
 * console.log(fullPath); // /Users/you/project/src/index.ts
 * ```
 */
const resolveApp = (relativePath: string): string => resolve(appDirectory, relativePath);

export { resolveApp };
