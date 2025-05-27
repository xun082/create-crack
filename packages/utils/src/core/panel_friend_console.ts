import fs from 'fs';
import kleur from 'kleur';

import { resolveApp } from './resolveApp';
import getPackageJsonInfo from './package_json_info';

const friendlySyntaxErrorLabel = 'Syntax error:';

// 添加一些美化用的符号和样式
const symbols = {
  success: '✅',
  info: 'ℹ️',
  warning: '⚠️',
  error: '❌',
  rocket: '🚀',
  globe: '🌐',
  computer: '💻',
  build: '🔨',
  sparkles: '✨',
  box: '📦',
};

const createBox = (content: string, color: (str: string) => string = kleur.white): string => {
  const lines = content.split('\n');

  // 移除 ANSI 颜色代码来计算实际长度
  const stripAnsi = (str: string) => str.replace(/\u001b\[[0-9;]*m/g, '');
  const maxLength = Math.max(...lines.map((line) => stripAnsi(line).length));
  const width = Math.min(maxLength + 6, 80); // 增加一些内边距

  const top = color('┌' + '─'.repeat(width - 2) + '┐');
  const bottom = color('└' + '─'.repeat(width - 2) + '┘');

  const paddedLines = lines.map((line) => {
    const actualLength = stripAnsi(line).length;
    const padding = ' '.repeat(Math.max(0, width - actualLength - 4));

    return color('│ ') + line + padding + color(' │');
  });

  return [top, ...paddedLines, bottom].join('\n');
};

export function clearConsole(): void {
  process.stdout.write(process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H');
}

// 获取当前时间戳
function getTimestamp(): string {
  const now = new Date();
  const time = now.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return kleur.gray(`[${time}]`);
}

// 显示编译开始状态
export function showCompilationStart(appName?: string): void {
  console.log();

  const startMessage = `${symbols.build} ${kleur.blue().bold('Compiling...')} ${appName ? kleur.cyan(appName) : ''}`;
  console.log(createBox(startMessage, kleur.blue));
  console.log(`${getTimestamp()} ${kleur.blue('webpack compiling...')}`);
  console.log();
}

// 显示编译错误
export function showCompilationErrors(errors: string[]): void {
  console.log();

  const errorTitle = `${symbols.error} ${kleur.red().bold('Failed to compile')} ${symbols.error}`;
  console.log(createBox(errorTitle, kleur.red));
  console.log(`${getTimestamp()} ${kleur.red('webpack compiled with errors')}`);
  console.log();

  errors.forEach((error, index) => {
    if (index > 0) console.log();
    console.log(error);
  });
  console.log();
}

// 显示编译警告
export function showCompilationWarnings(warnings: string[]): void {
  if (warnings.length === 0) return;

  console.log();

  const warningTitle = `${symbols.warning} ${kleur.yellow().bold(`Compiled with ${warnings.length} warning${warnings.length > 1 ? 's' : ''}`)} ${symbols.warning}`;
  console.log(createBox(warningTitle, kleur.yellow));
  console.log(`${getTimestamp()} ${kleur.yellow('webpack compiled with warnings')}`);
  console.log();

  warnings.forEach((warning, index) => {
    if (index > 0) console.log();
    console.log(warning);
  });
  console.log();
}

function isLikelyASyntaxError(message: string): boolean {
  return message.includes(friendlySyntaxErrorLabel);
}

// 美化错误消息的函数
function formatErrorMessage(message: string): string {
  if (message.includes(friendlySyntaxErrorLabel)) {
    return `${symbols.error} ${kleur.red().bold('Syntax Error')}\n${kleur.red(message)}`;
  }

  if (message.includes('Attempted import error:')) {
    return `${symbols.warning} ${kleur.yellow().bold('Import Error')}\n${kleur.yellow(message)}`;
  }

  if (message.includes('Module not found:') || message.includes('Cannot find file:')) {
    return `${symbols.error} ${kleur.red().bold('Module Not Found')}\n${kleur.red(message)}`;
  }

  return `${symbols.error} ${kleur.red(message)}`;
}

// 美化警告消息的函数
function formatWarningMessage(message: string): string {
  return `${symbols.warning} ${kleur.yellow(message)}`;
}

export function formatMessage(message: any): string {
  let lines: string[] = [];

  if (typeof message === 'string') {
    lines = message.split('\n');
  } else if ('message' in message && typeof message.message === 'string') {
    lines = message.message.split('\n');
  } else if (Array.isArray(message)) {
    message.forEach((item) => {
      if ('message' in item && typeof item.message === 'string') {
        lines = item.message.split('\n');
      }
    });
  }

  lines = lines.filter((line) => !/Module [A-z ]+\(from/.test(line));

  lines = lines.map((line) => {
    const parsingError = /Line (\d+):(?:(\d+):)?\s*Parsing error: (.+)$/.exec(line);
    if (!parsingError) return line;

    const [, errorLine, errorColumn, errorMessage] = parsingError;

    return `${friendlySyntaxErrorLabel} ${errorMessage} (${errorLine}:${errorColumn})`;
  });

  let formattedMessage = lines.join('\n');

  formattedMessage = formattedMessage.replace(
    /SyntaxError\s+\((\d+):(\d+)\)\s*(.+?)\n/g,
    `${friendlySyntaxErrorLabel} $3 ($1:$2)\n`,
  );

  formattedMessage = formattedMessage.replace(
    /^.*export '(.+?)' was not found in '(.+?)'.*$/gm,
    `Attempted import error: '$1' is not exported from '$2'.`,
  );
  formattedMessage = formattedMessage.replace(
    /^.*export 'default' \(imported as '(.+?)'\) was not found in '(.+?)'.*$/gm,
    `Attempted import error: '$2' does not contain a default export (imported as '$1').`,
  );
  formattedMessage = formattedMessage.replace(
    /^.*export '(.+?)' \(imported as '(.+?)'\) was not found in '(.+?)'.*$/gm,
    `Attempted import error: '$1' is not exported from '$3' (imported as '$2').`,
  );

  lines = formattedMessage.split('\n');

  if (lines.length > 2 && lines[1]?.trim() === '') {
    lines.splice(1, 1);
  }

  if (lines[0]) {
    lines[0] = lines[0].replace(/^(.*) \d+:\d+-\d+$/, '$1');
  }

  if (lines[1]?.startsWith('Module not found: ')) {
    lines = [
      lines[0] || '',
      lines[1]
        .replace('Error: ', '')
        .replace('Module not found: Cannot find file:', 'Cannot find file:'),
    ];
  }

  if (lines[1]?.match(/Cannot find module.+sass/)) {
    lines[1] =
      `${symbols.info} To import Sass files, you first need to install sass.\n` +
      `${symbols.build} Run ${kleur.cyan().bold(`npm install sass`)} or ${kleur.cyan().bold(`yarn add sass`)} inside your workspace.`;
  }

  formattedMessage = lines.join('\n');
  formattedMessage = formattedMessage.replace(/^\s*at\s((?!webpack:).)*:\d+:\d+[\s)]*(\n|$)/gm, '');
  formattedMessage = formattedMessage.replace(/^\s*at\s<anonymous>(\n|$)/gm, '');

  lines = formattedMessage.split('\n');
  lines = lines.filter(
    (line, index, arr) =>
      index === 0 || line.trim() !== '' || line.trim() !== arr[index - 1]?.trim(),
  );

  return formatErrorMessage(lines.join('\n').trim());
}

interface WebpackStats {
  errors: any[];
  warnings: any[];
}

export function formatWebpackMessages(json: WebpackStats): {
  errors: string[];
  warnings: string[];
} {
  const formattedErrors = json.errors.map(formatMessage);
  const formattedWarnings = json.warnings.map((warning) =>
    formatWarningMessage(formatMessage(warning)),
  );

  const result = { errors: formattedErrors, warnings: formattedWarnings };

  if (result.errors.some(isLikelyASyntaxError)) {
    result.errors = result.errors.filter(isLikelyASyntaxError);
  }

  return result;
}

function detectPackageManager(): string {
  if (fs.existsSync('package-lock.json')) return 'npm';
  if (fs.existsSync('pnpm-lock.yaml')) return 'pnpm';
  if (fs.existsSync('yarn.lock')) return 'yarn';

  return 'cnpm';
}

// 显示构建统计信息
export function showBuildStats(stats?: {
  duration?: number;
  size?: string;
  chunks?: number;
}): void {
  if (!stats) return;

  console.log();

  let statsContent = `${symbols.box} Build Statistics`;

  if (stats.duration) {
    statsContent += `\n⏱️  Duration: ${kleur.cyan(`${stats.duration}ms`)}`;
  }

  if (stats.size) {
    statsContent += `\n📊 Bundle Size: ${kleur.cyan(stats.size)}`;
  }

  if (stats.chunks) {
    statsContent += `\n🧩 Chunks: ${kleur.cyan(stats.chunks.toString())}`;
  }

  console.log(createBox(statsContent, kleur.magenta));
  console.log();
}

export function friendlyPrints(urls: {
  lanUrlForTerminal?: string;
  localUrlForTerminal: string;
}): void {
  const appName = getPackageJsonInfo(resolveApp('package.json'), false).name;
  const packageManager = detectPackageManager();

  console.log();

  // 成功编译的标题带时间戳
  const successTitle = `${symbols.sparkles} ${kleur.green().bold('Compiled successfully!')} ${symbols.sparkles}`;
  console.log(createBox(successTitle, kleur.green));

  // 显示时间戳
  console.log(`${getTimestamp()} ${kleur.green('webpack compiled successfully')}`);

  console.log();

  // 应用信息
  const appInfo = `${symbols.rocket} You can now view ${kleur.cyan().bold(appName || 'your app')} in the browser.`;
  console.log(kleur.white(appInfo));

  console.log();

  // URL 信息框
  let urlContent = '';

  if (urls.lanUrlForTerminal) {
    urlContent = `${symbols.computer} ${kleur.bold('Local:')}            ${kleur.cyan(urls.localUrlForTerminal)}\n${symbols.globe} ${kleur.bold('On Your Network:')}  ${kleur.cyan(urls.lanUrlForTerminal)}`;
  } else {
    urlContent = `${symbols.computer} ${kleur.cyan(urls.localUrlForTerminal)}`;
  }

  console.log(createBox(urlContent, kleur.blue));

  console.log();

  // 提示信息
  const noteContent = `${symbols.info} Note that the development build is not optimized.\n${symbols.build} To create a production build, use ${kleur.cyan().bold(`${packageManager} build`)}.`;
  console.log(createBox(noteContent, kleur.yellow));

  console.log();
}
