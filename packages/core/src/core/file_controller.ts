import { resolveApp } from '@verve-kit/utils';
import kleur from 'kleur';
import { createSpinner } from 'nanospinner';
import {
  existsSync,
  rmSync,
  mkdirSync,
  copyFileSync,
  statSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import * as tar from 'tar';

import { packageVersion } from './constants';

/**
 * 删除指定目录
 *
 * @param directoryPath - 要删除的目录路径（默认 "node_modules"）
 * @param verbose - 是否显示终端提示信息
 */
export async function removeDirectory(directoryPath = 'node_modules', verbose = true) {
  const fullPath = resolveApp(directoryPath);

  if (verbose) {
    const spinner = createSpinner(kleur.bold().cyan('File being deleted...')).start();

    try {
      if (existsSync(fullPath)) {
        rmSync(fullPath, { recursive: true, force: true });
      }

      spinner.success({ text: kleur.bold().green('Deleted successfully') });
    } catch (error) {
      spinner.error({ text: kleur.bold().red('Deletion failed') });
      console.error(error);
    }
  } else {
    if (existsSync(fullPath)) {
      rmSync(fullPath, { recursive: true, force: true });
    }
  }
}

/**
 * 递归复制文件夹
 *
 * @param sourceDir - 源文件夹路径
 * @param destinationDir - 目标文件夹路径
 */
async function copyFolderRecursive(sourceDir: string, destinationDir: string) {
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
        await copyFolderRecursive(src, dest);
      } else {
        copyFileSync(src, dest);
      }
    }
  } catch (error) {
    console.error(
      kleur.red('\n 😡😡😡 An error occurred during the template download, please try again'),
      error,
    );
    process.exit(1);
  }
}

/**
 * 下载并解压 NPM 包模板
 *
 * @param packageURL - 包的下载链接
 * @param packageName - 包名
 * @param projectName - 创建的项目目录名
 */
export async function getNpmPackage(
  packageURL: string,
  packageName: string,
  projectName: string,
): Promise<void> {
  const spinner = createSpinner(kleur.bold().cyan('Creating a project...')).start();

  try {
    const response = await fetch(packageURL);

    if (!response.ok) {
      throw new Error(`Failed to download package: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const currentDir = resolveApp(projectName);
    const tgzPath = join(currentDir, `${packageName}-${packageVersion}.tgz`);
    writeFileSync(tgzPath, buffer);

    await tar.extract({
      file: tgzPath,
      cwd: currentDir,
    });

    unlinkSync(tgzPath);
    await copyFolderRecursive(join(projectName, 'package/template'), projectName);
    await removeDirectory(join(projectName, 'package'), false);

    spinner.success({ text: kleur.bold().green('Project creation successful') });
  } catch (error) {
    spinner.error({ text: kleur.bold().red('Project creation failed') });
    console.error('Error:', error);
    process.exit(1);
  }
}
