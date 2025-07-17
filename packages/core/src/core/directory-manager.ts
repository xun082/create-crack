import { resolveApp } from '@verve-kit/utils';
import fs from 'fs-extra';
import { confirm } from '@clack/prompts';
import kleur from 'kleur';

import { UI_MESSAGES } from './constants';
import type { CreateAppOptions } from '../types';

/**
 * 创建项目根目录
 * 如果目录已存在且未强制覆盖，则询问用户是否覆盖
 */
export async function createProjectDirectory(
  name: string,
  options: CreateAppOptions,
): Promise<string> {
  const root = resolveApp(name);

  if ((await fs.pathExists(root)) && !options.force) {
    const shouldOverwrite = await confirm({
      message: UI_MESSAGES.OVERWRITE_CONFIRM,
    });

    if (!shouldOverwrite) {
      console.log(kleur.yellow('项目创建已取消'));
      process.exit(1);
    }

    await fs.remove(root);
  }

  await fs.ensureDir(root);

  return root;
}

/**
 * 确保目录存在，如不存在则创建
 */
export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}
