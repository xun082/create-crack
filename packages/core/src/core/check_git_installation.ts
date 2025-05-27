import { execSync } from 'node:child_process';

/**
 * 检查当前系统是否已安装 Git。
 *
 * @returns `true` 表示 Git 已安装，`false` 表示未安装。
 *
 * @example
 * ```ts
 * if (checkGitInstallation()) {
 *   console.log('Git is available.');
 * } else {
 *   console.log('Please install Git.');
 * }
 * ```
 */
export default function checkGitInstallation(): boolean {
  try {
    // 尝试静默执行 git --version，如果命令执行失败将抛出异常
    execSync('git --version', { stdio: 'ignore' });

    return true;
  } catch {
    return false;
  }
}
