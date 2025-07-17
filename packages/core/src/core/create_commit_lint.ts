import { join } from 'node:path';
import fs from 'fs-extra';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import { PackageJsonType } from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 获取模板目录路径 - 总是相对于包根目录
const getTemplateDir = async () => {
  // 向上查找到包含 package.json 的目录（包根目录）
  let currentDir = __dirname;

  while (!(await fs.pathExists(join(currentDir, 'package.json')))) {
    const parent = dirname(currentDir);

    if (parent === currentDir) {
      throw new Error('无法找到包根目录');
    }

    currentDir = parent;
  }

  return join(currentDir, 'template');
};

// 移除自己实现的复制函数，使用 fs-extra 的 copy 方法

/**
 * 为指定项目集成 commitlint 和相关 husky 配置。
 *
 * @param projectName - 项目目录名
 *
 * @example
 * ```ts
 * await createCommitlint('my-app');
 * ```
 */
export default async function createCommitlint(projectName: string): Promise<void> {
  try {
    // 复制 husky 模板文件
    const huskyTemplateSource = join(await getTemplateDir(), 'template-husky');

    if (await fs.pathExists(huskyTemplateSource)) {
      await fs.copy(huskyTemplateSource, projectName);
      console.log('✅ Husky 模板文件已复制');
    } else {
      console.warn('⚠️ Husky 模板目录未找到');

      return;
    }

    // 使用绝对路径
    const targetPackagePath = join(projectName, 'package.json');
    const huskyTemplatePath = join(__dirname, './package/husky.json');

    console.log(`读取 husky 模板: ${huskyTemplatePath}`);
    console.log(`读取项目 package.json: ${targetPackagePath}`);

    const huskyConfig = await fs.readJson(huskyTemplatePath);
    const projectPackageJson: PackageJsonType = await fs.readJson(targetPackagePath);

    // 合并 husky 配置到项目的 package.json 中
    for (const key in huskyConfig) {
      const sourceValue = huskyConfig[key];
      const targetValue = projectPackageJson[key];

      if (typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
        projectPackageJson[key] = {
          ...targetValue,
          ...sourceValue,
        };
      } else if (Array.isArray(sourceValue)) {
        projectPackageJson[key] = [...sourceValue, ...(targetValue ?? [])];
      } else {
        projectPackageJson[key] = sourceValue;
      }
    }

    await fs.writeJson(targetPackagePath, projectPackageJson, { spaces: 2 });
    console.log('✅ Commit Lint 配置已成功合并到 package.json');
  } catch (error) {
    console.error('❌ 创建 Commit Lint 配置时出错:', error);
    process.exit(1);
  }
}
