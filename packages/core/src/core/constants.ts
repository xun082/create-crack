import type { ProjectTemplate, PackageManager, ISelectType } from '../types';

/**
 * 支持的项目模板类型
 */
export const SUPPORTED_TEMPLATES: ProjectTemplate[] = ['react-web-js', 'react-web-ts'];

/**
 * 支持的包管理器
 */
export const SUPPORTED_PACKAGE_MANAGERS: PackageManager[] = ['npm', 'yarn', 'pnpm', 'cnpm'];

/**
 * 项目类型选择项配置
 */
export const PROJECT_TYPE_OPTIONS: ISelectType[] = [
  {
    value: 'react-web-js',
    label: 'react-web-js',
    hint: 'React + JavaScript Web应用程序 🚀',
  },
  {
    value: 'react-web-ts',
    label: 'react-web-ts',
    hint: 'React + TypeScript Web应用程序 🚀',
  },
];

/**
 * 包管理器选择项配置
 */
export const PACKAGE_MANAGER_OPTIONS: ISelectType[] = [
  { value: 'npm', label: 'npm' },
  { value: 'yarn', label: 'yarn' },
  { value: 'pnpm', label: 'pnpm' },
  { value: 'cnpm', label: 'cnpm' },
];

/**
 * 用户界面文本常量
 */
export const UI_MESSAGES = {
  INTRO: ' 🚧 Create Your App - 项目脚手架工具 ',
  SELECT_PROJECT_TYPE: '🎯 选择项目类型:',
  SELECT_PACKAGE_MANAGER: '📦 选择包管理器:',
  ENABLE_ESLINT: '🔍 是否启用 ESLint 代码检查?',
  ENABLE_COMMIT_LINT: '📝 是否启用 Commit Lint 配置?',
  OVERWRITE_CONFIRM: 'Target directory already exists. Overwrite?',
  CONFIG_SELECTION: '\n📋 请选择项目配置:\n',
  CREATING_PROJECT: '\n🔧 正在创建项目...',
  CTRL_C_EXIT: '⌨️  Ctrl+C pressed - Exiting the program',
} as const;

/**
 * 错误信息常量
 */
export const ERROR_MESSAGES = {
  INVALID_TEMPLATE: (template: string) => `❌ 无效的模板类型: ${template}`,
  INVALID_PACKAGE_MANAGER: (manager: string) => `❌ 无效的包管理器: ${manager}`,
  AVAILABLE_TEMPLATES: '可用的模板: react-web-js, react-web-ts',
  AVAILABLE_PACKAGE_MANAGERS: '可用的包管理器: npm, yarn, pnpm, cnpm',
} as const;

/**
 * 成功信息常量
 */
export const SUCCESS_MESSAGES = {
  PROJECT_CREATED: '🎉 项目创建成功！\n',
  FEATURES_INSTALLED: '📦 已安装的功能:',
  ESLINT_CREATED: '✅ ESLint 配置文件已创建',
  ESLINT_WARNING: '⚠️ ESLint 配置模板文件未找到',
  TEMPLATE_COPY_SUCCESS: '✅ 项目模板复制成功',
  DEPENDENCY_INSTALL_SUCCESS: '✅ Project initialization complete',
} as const;
