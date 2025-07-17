import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname, join } from 'node:path';

import { PackageJsonType } from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 获取并解析指定路径下的 package.json 文件。
 *
 * @param relativePath - 相对于当前模块目录的路径（当 `isFromCurrentDir` 为 `true` 时）
 * @param isFromCurrentDir - 如果为 `true`，则路径基于当前文件目录；否则视为绝对路径或调用方自定义路径
 * @returns 返回解析后的 package.json 内容对象
 *
 * @example
 * ```ts
 * const pkg = await getPackageJsonInfo('../package.json', true);
 * console.log(pkg.name);
 * ```
 */
async function getPackageJsonInfo(
  relativePath: string,
  isFromCurrentDir: boolean,
): Promise<PackageJsonType> {
  const filePath = isFromCurrentDir ? join(__dirname, relativePath) : relativePath;

  return await fs.readJson(filePath);
}

export default getPackageJsonInfo;
