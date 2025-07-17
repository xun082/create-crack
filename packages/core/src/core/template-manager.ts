import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import kleur from 'kleur';
import { createSpinner } from 'nanospinner';

import { SUCCESS_MESSAGES } from './constants';
import { createPackageJson, createTemplateFile } from './create_file';
import createCommitlint from './create_commit_lint';
import type { ProjectTemplate, ProjectContext } from '../types';

// 获取当前文件的目录路径
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

/**
 * 复制项目模板到目标目录
 */
export async function copyProjectTemplate(
  projectType: ProjectTemplate,
  projectRoot: string,
): Promise<void> {
  const spinner = createSpinner(kleur.bold().cyan('正在复制项目模板...')).start();

  try {
    const templateSource = join(await getTemplateDir(), `template-${projectType}`);

    if (!(await fs.pathExists(templateSource))) {
      throw new Error(`模板目录不存在: ${templateSource}`);
    }

    await fs.copy(templateSource, projectRoot);
    spinner.success({ text: kleur.bold().green(SUCCESS_MESSAGES.TEMPLATE_COPY_SUCCESS) });
  } catch (error) {
    spinner.error({ text: kleur.bold().red('❌ 项目模板复制失败') });
    console.error('Error:', error);
    throw error;
  }
}

/**
 * 创建 ESLint 配置文件
 */
export async function createEslintConfig(root: string): Promise<void> {
  try {
    const eslintConfigSource = join(await getTemplateDir(), 'eslint/eslint.config.mjs');
    const eslintConfigDest = join(root, 'eslint.config.mjs');

    if (await fs.pathExists(eslintConfigSource)) {
      await fs.copy(eslintConfigSource, eslintConfigDest);
      console.log(SUCCESS_MESSAGES.ESLINT_CREATED);
    } else {
      console.warn(SUCCESS_MESSAGES.ESLINT_WARNING);
    }
  } catch (error) {
    console.error('❌ 创建 ESLint 配置文件时出错:', error);
    throw error;
  }
}

/**
 * 创建项目的基础文件
 */
export async function createProjectFiles(context: ProjectContext): Promise<void> {
  const { root, config, name } = context;

  try {
    // 创建 package.json
    const pkg = await createPackageJson(config.projectType, name, config.enableEslint);
    await fs.writeJson(join(root, 'package.json'), pkg, { spaces: 2 });

    // 创建 .gitignore
    await fs.writeFile(join(root, '.gitignore'), createTemplateFile('gitignore'));

    // 复制项目模板
    await copyProjectTemplate(config.projectType, root);

    // 创建 commit lint 配置
    if (config.commitLint) {
      await createCommitlint(root);
    }

    // 创建 ESLint 配置
    if (config.enableEslint) {
      await createEslintConfig(root);
    }
  } catch (error) {
    console.error(kleur.red('❌ 创建项目文件时出错:'), error);
    throw error;
  }
}
