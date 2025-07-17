import kleur from 'kleur';

import type { ProjectTemplate, PackageManager, CreateAppOptions } from '../types';
import { SUPPORTED_TEMPLATES, SUPPORTED_PACKAGE_MANAGERS, ERROR_MESSAGES } from './constants';

/**
 * 验证项目模板类型是否有效
 */
export function validateTemplate(template: string): template is ProjectTemplate {
  return SUPPORTED_TEMPLATES.includes(template as ProjectTemplate);
}

/**
 * 验证包管理器是否有效
 */
export function validatePackageManager(manager: string): manager is PackageManager {
  return SUPPORTED_PACKAGE_MANAGERS.includes(manager as PackageManager);
}

/**
 * 验证并处理模板选项
 */
export function validateTemplateOption(template?: string): ProjectTemplate | undefined {
  if (!template) return undefined;

  if (!validateTemplate(template)) {
    console.error(kleur.red(ERROR_MESSAGES.INVALID_TEMPLATE(template)));
    console.error(kleur.yellow(ERROR_MESSAGES.AVAILABLE_TEMPLATES));
    process.exit(1);
  }

  return template as ProjectTemplate;
}

/**
 * 验证并处理包管理器选项
 */
export function validatePackageManagerOption(manager?: string): PackageManager | undefined {
  if (!manager) return undefined;

  if (!validatePackageManager(manager)) {
    console.error(kleur.red(ERROR_MESSAGES.INVALID_PACKAGE_MANAGER(manager)));
    console.error(kleur.yellow(ERROR_MESSAGES.AVAILABLE_PACKAGE_MANAGERS));
    process.exit(1);
  }

  return manager as PackageManager;
}

/**
 * 验证并规范化所有选项
 */
export function validateOptions(options: any): CreateAppOptions {
  const validated: CreateAppOptions = {
    force: Boolean(options.force),
  };

  // 只有在明确提供了值时才设置属性
  const template = validateTemplateOption(options.template);

  if (template) {
    validated.template = template;
  }

  const packageManager = validatePackageManagerOption(options.packageManager);

  if (packageManager) {
    validated.packageManager = packageManager;
  }

  if (options.eslint !== undefined) {
    validated.eslint = Boolean(options.eslint);
  }

  if (options.commitLint !== undefined) {
    validated.commitLint = Boolean(options.commitLint);
  }

  return validated;
}
