import { resolveApp } from '@verve-kit/utils';
import { existsSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'node:fs';
import { execSync, exec } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { confirm, intro, select } from '@clack/prompts';
import kleur from 'kleur';
import { createSpinner } from 'nanospinner';

import { removeDirectory } from './file_controller';
import { ProjectTypes, PackageManagers } from './question';
import isGitInstalled from './check_git_installation';
import createSuccessInfo from './create_success_info';
import createCommitlint from './create_commit_lint';
import { createPackageJson, createTemplateFile } from './create_file';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 设置 Ctrl+C 退出监听（仅限终端环境）
 */
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
  process.stdin.on('data', (key) => {
    if (key[0] === 3) {
      console.log('⌨️  Ctrl+C pressed - Exiting the program');
      process.exit(1);
    }
  });
}

/**
 * 创建项目根目录，如有同名文件则询问是否覆盖
 *
 * @param name - 项目名
 * @param force - 是否强制覆盖
 */
const makeDirectory = async (name: string, { force }: { force: boolean }) => {
  const root = resolveApp(name);

  if (existsSync(root) && !force) {
    const shouldOverwrite = await confirm({
      message: 'Target directory already exists. Overwrite?',
    });
    if (!shouldOverwrite) process.exit(1);
    await removeDirectory(name, true);
  }

  mkdirSync(root, { recursive: true });
};

/**
 * 收集用户交互选择的信息
 */
const getTableInfo = async (options: any) => {
  let projectType: string;
  let packageManager: string;
  let enableEslint: boolean;
  let commitLint: boolean;

  // 检查是否提供了模板参数
  if (options.template) {
    if (!['react-web-js', 'react-web-ts'].includes(options.template)) {
      console.error(kleur.red(`❌ 无效的模板类型: ${options.template}`));
      console.error(kleur.yellow('可用的模板: react-web-js, react-web-ts'));
      process.exit(1);
    }

    projectType = options.template;
  } else {
    projectType = (await select({
      message: '🎯 选择项目类型:',
      options: ProjectTypes,
    })) as string;
  }

  // 检查是否提供了包管理器参数
  if (options.packageManager) {
    if (!['npm', 'yarn', 'pnpm', 'cnpm'].includes(options.packageManager)) {
      console.error(kleur.red(`❌ 无效的包管理器: ${options.packageManager}`));
      console.error(kleur.yellow('可用的包管理器: npm, yarn, pnpm, cnpm'));
      process.exit(1);
    }

    packageManager = options.packageManager;
  } else {
    packageManager = (await select({
      message: '📦 选择包管理器:',
      options: PackageManagers,
    })) as string;
  }

  // 检查 ESLint 选项
  if (options.eslint !== undefined) {
    enableEslint = options.eslint;
  } else {
    enableEslint = (await confirm({
      message: '🔍 是否启用 ESLint 代码检查?',
    })) as boolean;
  }

  // 检查 Commit Lint 选项
  if (options.commitLint !== undefined) {
    commitLint = options.commitLint;
  } else {
    commitLint = (await confirm({
      message: '📝 是否启用 Commit Lint 配置?',
    })) as boolean;
  }

  return { projectType, packageManager, enableEslint, commitLint };
};

/**
 * 创建 ESLint 配置文件
 *
 * @param root - 项目根目录路径
 */
const createEslintConfig = (root: string) => {
  try {
    const eslintConfigSource = join(__dirname, '../template/eslint/eslint.config.mjs');
    const eslintConfigDest = join(root, 'eslint.config.mjs');

    if (existsSync(eslintConfigSource)) {
      copyFileSync(eslintConfigSource, eslintConfigDest);
      console.log('✅ ESLint 配置文件已创建');
    } else {
      console.warn('⚠️ ESLint 配置模板文件未找到');
    }
  } catch (error) {
    console.error('❌ 创建 ESLint 配置文件时出错:', error);
  }
};

/**
 * 递归复制文件夹
 *
 * @param sourceDir - 源文件夹路径
 * @param destinationDir - 目标文件夹路径
 */
const copyFolderRecursive = (sourceDir: string, destinationDir: string) => {
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
        copyFolderRecursive(src, dest);
      } else {
        copyFileSync(src, dest);
      }
    }
  } catch (error) {
    console.error(kleur.red('❌ 复制模板文件时出错:'), error);
    process.exit(1);
  }
};

/**
 * 复制本地模板到项目目录
 *
 * @param projectType - 项目类型
 * @param projectRoot - 项目根目录
 */
const copyLocalTemplate = (projectType: string, projectRoot: string) => {
  const spinner = createSpinner(kleur.bold().cyan('正在复制项目模板...')).start();

  try {
    const templateSource = join(__dirname, `../template/template-${projectType}`);

    if (!existsSync(templateSource)) {
      throw new Error(`模板目录不存在: ${templateSource}`);
    }

    copyFolderRecursive(templateSource, projectRoot);
    spinner.success({ text: kleur.bold().green('✅ 项目模板复制成功') });
  } catch (error) {
    spinner.error({ text: kleur.bold().red('❌ 项目模板复制失败') });
    console.error('Error:', error);
    process.exit(1);
  }
};

/**
 * 创建项目主流程
 *
 * @param name - 项目名
 * @param options - 控制参数
 */
export default async function createApp(name: string, options: any) {
  intro(kleur.green(' 🚧 Create Your App - 项目脚手架工具 '));

  const root = resolveApp(name);
  await makeDirectory(name, options);

  // 检查是否使用了命令行参数（非交互模式）
  const isNonInteractive =
    options.template ||
    options.packageManager ||
    options.eslint !== undefined ||
    options.commitLint !== undefined;

  if (!isNonInteractive) {
    console.log(kleur.cyan('\n📋 请选择项目配置:\n'));
  }

  const { projectType, packageManager, enableEslint, commitLint } = await getTableInfo(options);

  console.log(kleur.yellow('\n🔧 正在创建项目...'));
  console.log(kleur.gray(`📁 项目名称: ${name}`));
  console.log(kleur.gray(`🎯 项目类型: ${projectType}`));
  console.log(kleur.gray(`📦 包管理器: ${packageManager}`));
  console.log(kleur.gray(`🔍 ESLint: ${enableEslint ? '启用' : '禁用'}`));
  console.log(kleur.gray(`📝 Commit Lint: ${commitLint ? '启用' : '禁用'}`));

  // 写入 package.json
  const pkg = await createPackageJson(projectType, name, enableEslint);
  writeFileSync(join(root, 'package.json'), JSON.stringify(pkg, null, 2));

  // 写入 .gitignore
  writeFileSync(join(root, '.gitignore'), createTemplateFile('gitignore'));

  // 复制本地模板文件
  copyLocalTemplate(projectType, root);

  // 注入 lint 配置
  if (commitLint) {
    createCommitlint(root);
  }

  // 创建 ESLint 配置文件
  if (enableEslint) {
    createEslintConfig(root);
  }

  // 安装依赖
  const spinner = createSpinner(kleur.bold('Installing dependencies...')).start();
  exec(`${packageManager} install`, { cwd: root }, (err) => {
    if (err) {
      spinner.error({ text: kleur.red('Failed to install dependencies') });
      console.error(err);
      process.exit(1);
    } else {
      spinner.success({ text: kleur.green('✅ Project initialization complete') });

      // 显示项目创建成功的详细信息
      console.log(kleur.green('\n🎉 项目创建成功！\n'));
      console.log(kleur.cyan('📦 已安装的功能:'));
      console.log(
        kleur.gray(
          `  • ${projectType === 'react-web-ts' ? 'React + TypeScript' : 'React + JavaScript'} 项目模板`,
        ),
      );

      if (enableEslint) {
        console.log(kleur.gray('  • ESLint 代码检查工具'));
      }

      if (commitLint) {
        console.log(kleur.gray('  • Commit Lint 提交规范'));
      }

      createSuccessInfo(name, packageManager);
    }
  });

  // 初始化 Git 仓库
  if (isGitInstalled()) {
    execSync('git init', { cwd: root });
  }
}
