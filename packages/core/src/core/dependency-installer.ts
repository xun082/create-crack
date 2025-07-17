import { execa } from 'execa';
import kleur from 'kleur';
import { createSpinner } from 'nanospinner';

import isGitInstalled from './check_git_installation';
import createSuccessInfo from './create_success_info';
import { SUCCESS_MESSAGES } from './constants';
import type { PackageManager, ProjectContext } from '../types';

/**
 * 安装项目依赖
 */
export async function installDependencies(
  packageManager: PackageManager,
  projectRoot: string,
): Promise<void> {
  const spinner = createSpinner(kleur.bold('Installing dependencies...')).start();

  try {
    await execa(packageManager, ['install'], { cwd: projectRoot });
    spinner.success({ text: kleur.green(SUCCESS_MESSAGES.DEPENDENCY_INSTALL_SUCCESS) });
  } catch (error) {
    spinner.error({ text: kleur.red('Failed to install dependencies') });
    console.error(error);
    throw error;
  }
}

/**
 * 初始化 Git 仓库
 */
export async function initializeGitRepository(projectRoot: string): Promise<void> {
  try {
    if (isGitInstalled()) {
      await execa('git', ['init'], { cwd: projectRoot, stdio: 'ignore' });
      console.log(kleur.green('✅ Git 仓库初始化成功'));
    } else {
      console.warn(kleur.yellow('⚠️ Git 未安装，跳过 Git 仓库初始化'));
    }
  } catch (error) {
    console.warn(kleur.yellow('⚠️ Git 仓库初始化失败:'), error);
  }
}

/**
 * 显示项目创建成功的信息
 */
export function displaySuccessInfo(context: ProjectContext): void {
  const { name, config } = context;

  console.log(kleur.green(SUCCESS_MESSAGES.PROJECT_CREATED));
  console.log(kleur.cyan(SUCCESS_MESSAGES.FEATURES_INSTALLED));

  console.log(
    kleur.gray(
      `  • ${config.projectType === 'react-web-ts' ? 'React + TypeScript' : 'React + JavaScript'} 项目模板`,
    ),
  );

  if (config.enableEslint) {
    console.log(kleur.gray('  • ESLint 代码检查工具'));
  }

  if (config.commitLint) {
    console.log(kleur.gray('  • Commit Lint 提交规范'));
  }

  createSuccessInfo(name, config.packageManager);
}

/**
 * 执行后续设置：安装依赖、初始化Git、显示成功信息
 */
export async function performPostSetup(context: ProjectContext): Promise<void> {
  try {
    // 安装依赖
    await installDependencies(context.config.packageManager, context.root);

    // 初始化 Git 仓库
    await initializeGitRepository(context.root);

    // 显示成功信息
    displaySuccessInfo(context);
  } catch (error) {
    console.error(kleur.red('❌ 项目后续设置过程中发生错误:'), error);
    throw error;
  }
}
