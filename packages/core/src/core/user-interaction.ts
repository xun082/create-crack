import { confirm, select } from '@clack/prompts';

import type { ProjectConfig, CreateAppOptions, ProjectTemplate, PackageManager } from '../types';
import { PROJECT_TYPE_OPTIONS, PACKAGE_MANAGER_OPTIONS, UI_MESSAGES } from './constants';

/**
 * 收集用户的项目配置选择
 */
export async function collectUserConfiguration(options: CreateAppOptions): Promise<ProjectConfig> {
  let projectType: ProjectTemplate;
  let packageManager: PackageManager;
  let enableEslint: boolean;
  let commitLint: boolean;

  // 获取项目类型
  if (options.template) {
    projectType = options.template;
  } else {
    projectType = (await select({
      message: UI_MESSAGES.SELECT_PROJECT_TYPE,
      options: PROJECT_TYPE_OPTIONS,
    })) as ProjectTemplate;
  }

  // 获取包管理器
  if (options.packageManager) {
    packageManager = options.packageManager;
  } else {
    packageManager = (await select({
      message: UI_MESSAGES.SELECT_PACKAGE_MANAGER,
      options: PACKAGE_MANAGER_OPTIONS,
    })) as PackageManager;
  }

  // 获取 ESLint 选项
  if (options.eslint !== undefined) {
    enableEslint = options.eslint;
  } else {
    enableEslint = (await confirm({
      message: UI_MESSAGES.ENABLE_ESLINT,
    })) as boolean;
  }

  // 获取 Commit Lint 选项
  if (options.commitLint !== undefined) {
    commitLint = options.commitLint;
  } else {
    commitLint = (await confirm({
      message: UI_MESSAGES.ENABLE_COMMIT_LINT,
    })) as boolean;
  }

  return {
    projectType,
    packageManager,
    enableEslint,
    commitLint,
  };
}

/**
 * 检查是否为非交互模式
 */
export function isNonInteractiveMode(options: CreateAppOptions): boolean {
  return !!(
    options.template ||
    options.packageManager ||
    options.eslint !== undefined ||
    options.commitLint !== undefined
  );
}
