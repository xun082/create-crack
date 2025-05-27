import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { fileURLToPath } from 'url';
import { dirname } from 'node:path';

import getPackageJsonInfo from './package_info';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('getPackageJsonInfo', () => {
  it('should read and parse package.json from relative path', () => {
    // 使用测试夹具文件
    const testFixturePath = '../../test-fixtures/package.json';
    const packageInfo = getPackageJsonInfo(testFixturePath, true);

    expect(packageInfo).toBeDefined();
    expect(packageInfo.name).toBe('test-package');
    expect(packageInfo.version).toBe('1.0.0');
    expect(packageInfo.description).toBe('Test package for unit testing');
    expect(packageInfo.author).toBe('Test Author');
    expect(packageInfo.license).toBe('MIT');
  });

  it('should read package.json from absolute path', () => {
    // 构建绝对路径
    const absolutePath = join(__dirname, '../../test-fixtures/package.json');
    const packageInfo = getPackageJsonInfo(absolutePath, false);

    expect(packageInfo).toBeDefined();
    expect(packageInfo.name).toBe('test-package');
    expect(packageInfo.version).toBe('1.0.0');
  });

  it('should handle package.json with all standard fields', () => {
    const testFixturePath = '../../test-fixtures/package.json';
    const packageInfo = getPackageJsonInfo(testFixturePath, true);

    // 验证所有字段都被正确解析
    expect(typeof packageInfo.name).toBe('string');
    expect(typeof packageInfo.version).toBe('string');
    expect(typeof packageInfo.description).toBe('string');
    expect(typeof packageInfo.main).toBe('string');
    expect(typeof packageInfo.scripts).toBe('object');
    expect(Array.isArray(packageInfo.keywords)).toBe(true);
    expect(typeof packageInfo.author).toBe('string');
    expect(typeof packageInfo.license).toBe('string');
  });

  it('should throw error for non-existent file', () => {
    expect(() => {
      getPackageJsonInfo('non-existent-file.json', false);
    }).toThrow();
  });

  it('should handle different path formats correctly', () => {
    // 测试相对路径模式
    const relativeResult = getPackageJsonInfo('../../test-fixtures/package.json', true);

    // 测试绝对路径模式
    const absolutePath = join(__dirname, '../../test-fixtures/package.json');
    const absoluteResult = getPackageJsonInfo(absolutePath, false);

    // 两种方式应该得到相同的结果
    expect(relativeResult).toEqual(absoluteResult);
  });
});
