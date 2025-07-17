export interface PackageJsonType {
  name?: string;
  version?: string;
  description?: string;
  main?: string;
  types?: string;
  scripts?: { [scriptName: string]: string };
  repository?: {
    type: string;
    url: string;
  };
  keywords?: string[];
  author?:
    | string
    | {
        name: string;
        email?: string;
        url?: string;
      };
  license?: string;
  dependencies?: { [packageName: string]: string };
  devDependencies?: { [packageName: string]: string };
  peerDependencies?: { [packageName: string]: string };
  optionalDependencies?: { [packageName: string]: string };
  engines?: {
    node?: string;
    npm?: string;
  };
  config?: { [key: string]: any };
  'lint-staged'?: { [globPattern: string]: string | string[] };
  [key: string]: any; // 添加索引签名以支持动态属性访问
}

// 新增：项目模板类型
export type ProjectTemplate = 'react-web-js' | 'react-web-ts';

// 新增：包管理器类型
export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'cnpm';

// 新增：命令行选项接口
export interface CreateAppOptions {
  force?: boolean;
  template?: ProjectTemplate;
  packageManager?: PackageManager;
  eslint?: boolean;
  commitLint?: boolean;
}

// 新增：项目配置接口
export interface ProjectConfig {
  projectType: ProjectTemplate;
  packageManager: PackageManager;
  enableEslint: boolean;
  commitLint: boolean;
}

// 新增：项目创建上下文接口
export interface ProjectContext {
  name: string;
  root: string;
  config: ProjectConfig;
  options: CreateAppOptions;
}

// 新增：选择项接口
export interface ISelectType {
  value: string;
  label: string;
  hint?: string;
}
