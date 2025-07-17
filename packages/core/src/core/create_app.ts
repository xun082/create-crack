import { resolveApp } from '@verve-kit/utils';
import { intro } from '@clack/prompts';
import kleur from 'kleur';

import { validateOptions } from './validators';
import { collectUserConfiguration, isNonInteractiveMode } from './user-interaction';
import { createProjectDirectory } from './directory-manager';
import { createProjectFiles } from './template-manager';
import { performPostSetup } from './dependency-installer';
import { UI_MESSAGES } from './constants';
import type { ProjectContext } from '../types';

/**
 * 设置 Ctrl+C 退出监听（仅限终端环境）
 */
function setupExitHandler(): void {
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
    process.stdin.on('data', (key) => {
      if (key[0] === 3) {
        console.log(UI_MESSAGES.CTRL_C_EXIT);
        process.exit(1);
      }
    });
  }
}

/**
 * 显示配置信息
 */
function displayConfiguration(context: ProjectContext): void {
  const { name, config } = context;

  console.log(kleur.yellow(UI_MESSAGES.CREATING_PROJECT));
  console.log(kleur.gray(`📁 项目名称: ${name}`));
  console.log(kleur.gray(`🎯 项目类型: ${config.projectType}`));
  console.log(kleur.gray(`📦 包管理器: ${config.packageManager}`));
  console.log(kleur.gray(`🔍 ESLint: ${config.enableEslint ? '启用' : '禁用'}`));
  console.log(kleur.gray(`📝 Commit Lint: ${config.commitLint ? '启用' : '禁用'}`));
}

/**
 * 创建项目上下文
 */
async function createProjectContext(name: string, rawOptions: any): Promise<ProjectContext> {
  const options = validateOptions(rawOptions);
  const root = resolveApp(name);
  const config = await collectUserConfiguration(options);

  return {
    name,
    root,
    config,
    options,
  };
}

/**
 * 创建项目主流程
 *
 * @param name - 项目名
 * @param rawOptions - 控制参数
 */
export default async function createApp(name: string, rawOptions: any): Promise<void> {
  try {
    // 设置退出处理器
    setupExitHandler();

    // 显示欢迎信息
    intro(kleur.green(UI_MESSAGES.INTRO));

    // 创建项目上下文
    const context = await createProjectContext(name, rawOptions);

    // 如果是交互模式，显示配置选择提示
    if (!isNonInteractiveMode(context.options)) {
      console.log(kleur.cyan(UI_MESSAGES.CONFIG_SELECTION));
    }

    // 显示配置信息
    displayConfiguration(context);

    // 创建项目目录
    context.root = await createProjectDirectory(name, context.options);

    // 创建项目文件
    await createProjectFiles(context);

    // 执行后续设置（安装依赖、初始化Git、显示成功信息）
    await performPostSetup(context);
  } catch (error) {
    console.error(kleur.red('❌ 项目创建过程中发生错误:'), error);
    process.exit(1);
  }
}
