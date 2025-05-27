import os from 'node:os';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import kleur from 'kleur';

import getPackageJsonInfo from './package_info.js';
import type { PackageJsonType } from '../types';
import { PACKAGES_TO_UPDATE } from './package-versions';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 添加调试信息
console.log('create_file.ts __dirname:', __dirname);

/**
 * 获取 npm 包的最新版本
 *
 * @param packageName - 包名
 * @returns Promise<string> - 最新版本号，如果获取失败则返回默认版本
 */
async function getLatestPackageVersion(packageName: string): Promise<string | null> {
  try {
    const response = await fetch(`https://registry.npmjs.org/${packageName}/latest`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return `^${data.version}`;
  } catch (error) {
    console.warn(kleur.yellow(`⚠️ 无法获取 ${packageName} 的最新版本，跳过更新`));
    console.warn(kleur.gray(`错误信息: ${error}`));

    return null;
  }
}

/**
 * 更新包依赖的版本号为最新版本
 *
 * @param packageJson - package.json 对象
 * @returns Promise<PackageJsonType> - 更新后的 package.json 对象
 */
async function updatePackageVersions(packageJson: PackageJsonType): Promise<PackageJsonType> {
  console.log(kleur.cyan('🔄 正在获取最新包版本...'));

  const packagesToUpdate = PACKAGES_TO_UPDATE;

  // 并发获取所有包的最新版本
  const versionPromises = packagesToUpdate.map(async (packageName) => {
    const version = await getLatestPackageVersion(packageName);

    return { packageName, version };
  });

  try {
    const versionResults = await Promise.all(versionPromises);

    // 更新 dependencies
    if (packageJson.dependencies) {
      for (const { packageName, version } of versionResults) {
        if (version && packageJson.dependencies[packageName]) {
          packageJson.dependencies[packageName] = version;
          console.log(kleur.green(`✅ 更新 ${packageName}: ${version}`));
        }
      }
    }

    // 更新 devDependencies
    if (packageJson.devDependencies) {
      for (const { packageName, version } of versionResults) {
        if (version && packageJson.devDependencies[packageName]) {
          packageJson.devDependencies[packageName] = version;
          console.log(kleur.green(`✅ 更新 ${packageName}: ${version}`));
        }
      }
    }

    console.log(kleur.green('🎉 包版本更新完成'));
  } catch (error) {
    console.error(kleur.red('❌ 更新包版本时出错:'), error);
  }

  return packageJson;
}

/**
 * 合并 ESLint 配置到 package.json 中
 *
 * @param packageJson - 基础的 package.json 对象
 * @returns 合并了 ESLint 配置的 package.json 对象
 */
function mergeEslintConfig(packageJson: PackageJsonType): PackageJsonType {
  try {
    const eslintConfigPath = join(__dirname, '../package/eslint.json');
    const eslintConfig = getPackageJsonInfo(eslintConfigPath, false);

    if (!eslintConfig) {
      console.warn('⚠️ ESLint 配置文件未找到，跳过 ESLint 配置合并');

      return packageJson;
    }

    // 合并 scripts
    if (eslintConfig.scripts) {
      packageJson.scripts = {
        ...packageJson.scripts,
        ...eslintConfig.scripts,
      };
    }

    // 合并 devDependencies
    if (eslintConfig.devDependencies) {
      packageJson.devDependencies = {
        ...packageJson.devDependencies,
        ...eslintConfig.devDependencies,
      };
    }

    // 合并 lint-staged
    if (eslintConfig['lint-staged']) {
      packageJson['lint-staged'] = eslintConfig['lint-staged'];
    }

    console.log('✅ ESLint 配置已成功合并到 package.json');

    return packageJson;
  } catch (error) {
    console.error('❌ 合并 ESLint 配置时出错:', error);

    return packageJson;
  }
}

/**
 * 创建指定类型项目的 `package.json` 对象。
 *
 * @param projectType - 模板类型（如：react、vue、node 等）
 * @param projectName - 项目名称，会被写入到 `package.json.name`
 * @param enableEslint - 是否启用 ESLint 配置
 * @returns 返回已定制的 `package.json` 对象
 *
 * @example
 * ```ts
 * const pkg = createPackageJson('react-web-ts', 'my-app', true);
 * console.log(pkg.name); // 'my-app'
 * ```
 */
async function createPackageJson(
  projectType: string,
  projectName: string,
  enableEslint: boolean = false,
): Promise<PackageJsonType> {
  try {
    // 从 package 目录读取对应项目类型的 JSON 文件
    const templatePath = join(__dirname, `../package/${projectType}.json`);
    console.log(`尝试读取模板: ${templatePath}`);

    const packageInfo = getPackageJsonInfo(templatePath, false);
    if (!packageInfo) throw new Error('Package info is undefined');

    packageInfo.author = os.userInfo().username;
    packageInfo.name = projectName;

    // 更新包版本为最新版本
    const updatedPackageInfo = await updatePackageVersions(packageInfo);

    // 如果启用了 ESLint，合并 ESLint 配置
    if (enableEslint) {
      return mergeEslintConfig(updatedPackageInfo);
    }

    return updatedPackageInfo;
  } catch (error) {
    console.error(`❌ Failed to create package.json for "${projectType}"`);
    console.error(error);
    process.exit(1);
  }
}

/**
 * 读取模板目录中的任意 JSON 文件为字符串内容。
 *
 * @param fileName - 模板文件名（例如：`config.json`）
 * @returns 返回文件内容的字符串
 *
 * @example
 * ```ts
 * const config = createTemplateFile('vite.config.json');
 * console.log(JSON.parse(config));
 * ```
 */
function createTemplateFile(fileName: string): string {
  const filePath = join(__dirname, `../package/${fileName}`);

  return readFileSync(filePath, 'utf-8');
}

export { createPackageJson, createTemplateFile };
