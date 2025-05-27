import { join } from 'node:path';
import { writeFileSync, existsSync, copyFileSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import kleur from 'kleur';

import { PackageJsonType } from '../types';
import getPackageJsonInfo from './package_info.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 递归复制文件夹
 *
 * @param sourceDir - 源文件夹路径
 * @param destinationDir - 目标文件夹路径
 */
const copyFolderRecursive = (sourceDir: string, destinationDir: string) => {
  try {
    if (!existsSync(destinationDir)) {
      mkdirSync(destinationDir, { recursive: true });
    }

    const items = readdirSync(sourceDir);

    for (const item of items) {
      const src = join(sourceDir, item);
      const dest = join(destinationDir, item);
      const stat = statSync(src);

      if (stat.isDirectory()) {
        copyFolderRecursive(src, dest);
      } else {
        copyFileSync(src, dest);
      }
    }
  } catch (error) {
    console.error(kleur.red('❌ 复制 husky 模板文件时出错:'), error);
    process.exit(1);
  }
};

/**
 * 为指定项目集成 commitlint 和相关 husky 配置。
 *
 * @param projectName - 项目目录名
 *
 * @example
 * ```ts
 * createCommitlint('my-app');
 * ```
 */
export default function createCommitlint(projectName: string): void {
  try {
    // 复制 husky 模板文件
    const huskyTemplateSource = join(__dirname, '../template/template-husky');

    if (existsSync(huskyTemplateSource)) {
      copyFolderRecursive(huskyTemplateSource, projectName);
      console.log('✅ Husky 模板文件已复制');
    } else {
      console.warn('⚠️ Husky 模板目录未找到');

      return;
    }

    // 使用绝对路径
    const targetPackagePath = join(projectName, 'package.json');
    const huskyTemplatePath = join(__dirname, '../src/package/husky.json');

    console.log(`读取 husky 模板: ${huskyTemplatePath}`);
    console.log(`读取项目 package.json: ${targetPackagePath}`);

    const huskyConfig = getPackageJsonInfo(huskyTemplatePath, false);
    const projectPackageJson: PackageJsonType = getPackageJsonInfo(targetPackagePath, false);

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

    writeFileSync(targetPackagePath, JSON.stringify(projectPackageJson, null, 2), 'utf-8');
    console.log('✅ Commit Lint 配置已成功合并到 package.json');
  } catch (error) {
    console.error('❌ 创建 Commit Lint 配置时出错:', error);
    process.exit(1);
  }
}
