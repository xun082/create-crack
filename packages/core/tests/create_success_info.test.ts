import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import createSuccessInfo from '../src/core/create_success_info';

describe('createSuccessInfo', () => {
  let consoleSpy: any;
  let stdoutSpy: any;

  beforeEach(() => {
    // 模拟 console.log 和 process.stdout.write
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    // 恢复原始函数
    consoleSpy.mockRestore();
    stdoutSpy.mockRestore();
  });

  it('应该调用 process.stdout.write 显示成功信息', () => {
    createSuccessInfo('my-app', 'npm');

    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('my-app'));
  });

  it('应该调用 console.log 显示后续命令', () => {
    createSuccessInfo('my-app', 'npm');

    expect(consoleSpy).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Get started'));
  });

  it('应该在输出中包含项目名称', () => {
    const projectName = 'test-project';
    createSuccessInfo(projectName, 'yarn');

    // 检查 stdout 输出包含项目名称
    const stdoutCall = stdoutSpy.mock.calls[0][0];
    expect(stdoutCall).toContain(projectName);
  });

  it('应该在输出中包含包管理器命令', () => {
    const packageManager = 'pnpm';
    createSuccessInfo('my-app', packageManager);

    // 检查 console.log 输出包含包管理器
    const logCalls = consoleSpy.mock.calls.flat();
    const hasPackageManager = logCalls.some(
      (call: string) => call && call.includes && call.includes(packageManager),
    );
    expect(hasPackageManager).toBe(true);
  });

  it('应该显示正确的项目目录命令', () => {
    const projectName = 'awesome-app';
    createSuccessInfo(projectName, 'npm');

    const logCalls = consoleSpy.mock.calls.flat();
    const hasCdCommand = logCalls.some(
      (call: string) => call && call.includes && call.includes(`cd ${projectName}`),
    );
    expect(hasCdCommand).toBe(true);
  });
});
