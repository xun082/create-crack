#!/usr/bin/env node

// 导出配置加载器类型，供用户使用
export type { ConfigContext, UserConfig } from './utils/config-loader.js';
export { WebpackConfigLoader, createConfigLoader } from './utils/config-loader.js';

import crossSpawn from 'cross-spawn';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

// ESM 模块中获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 获取参数
const argument = process.argv.slice(2);

// 定义支持的命令
const validCommands = ['start', 'build', 'analyzer'] as const;

// 通过类型限制可选命令
type Command = (typeof validCommands)[number];

function showHelp() {
  console.log(`
Usage: react-script-crack <command>

Commands:
  start      Start development server
  build      Build for production
  analyzer   Analyze bundle size

Options:
  --help     Show help
  --version  Show version
`);
}

function showVersion() {
  // 读取 package.json 获取版本信息
  try {
    const packagePath = path.resolve(__dirname, '../package.json');
    const pkgContent = readFileSync(packagePath, 'utf-8');
    const pkg = JSON.parse(pkgContent);
    console.log(pkg.version);
  } catch {
    console.log('1.2.0');
  }
}

function runScript(command: Command) {
  // 生成脚本路径
  const scriptPath = path.resolve(__dirname, 'script', `${command}.js`);

  // 使用 node 执行编译后的 JavaScript 文件
  const result = crossSpawn.sync('node', [scriptPath], {
    stdio: 'inherit',
  });

  // 处理信号中断
  if (result.signal) {
    if (result.signal === 'SIGKILL') {
      console.log(
        'The build failed because the process exited too early. ' +
          'This probably means the system ran out of memory or someone called ' +
          '`kill -9` on the process.',
      );
    } else if (result.signal === 'SIGTERM') {
      console.log(
        'The build failed because the process exited too early. ' +
          'Someone might have called `kill` or `kill all`, or the system could ' +
          'be shutting down.',
      );
    }

    process.exit(1);
  }

  // 退出码
  process.exit(result.status ?? 1);
}

// 处理帮助和版本参数
if (argument.includes('--help') || argument.includes('-h')) {
  showHelp();
  process.exit(0);
}

if (argument.includes('--version') || argument.includes('-v')) {
  showVersion();
  process.exit(0);
}

// 校验命令是否支持
if (argument.length > 0 && validCommands.includes(argument[0] as Command)) {
  runScript(argument[0] as Command);
} else {
  console.log(`Unknown script "${argument[0]}".`);
  console.log('Run "react-script-crack --help" for available commands.');
  process.exit(1);
}
