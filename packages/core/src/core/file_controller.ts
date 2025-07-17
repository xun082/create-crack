import { resolveApp } from '@verve-kit/utils';
import kleur from 'kleur';
import { createSpinner } from 'nanospinner';
import fs from 'fs-extra';

/**
 * 删除指定目录
 *
 * @param directoryPath - 要删除的目录路径（默认 "node_modules"）
 * @param verbose - 是否显示终端提示信息
 */
export async function removeDirectory(
  directoryPath = 'node_modules',
  verbose = true,
): Promise<void> {
  const fullPath = resolveApp(directoryPath);

  if (verbose) {
    const spinner = createSpinner(kleur.bold().cyan('File being deleted...')).start();

    try {
      if (await fs.pathExists(fullPath)) {
        await fs.remove(fullPath);
      }

      spinner.success({ text: kleur.bold().green('Deleted successfully') });
    } catch (error) {
      spinner.error({ text: kleur.bold().red('Deletion failed') });
      console.error(error);
    }
  } else {
    if (await fs.pathExists(fullPath)) {
      await fs.remove(fullPath);
    }
  }
}
