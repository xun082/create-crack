import { describe, it, expect } from 'vitest';

import { getIPAddress } from '../src/core/ip_address';

describe('getIPAddress', () => {
  it('应该返回一个字符串', () => {
    const ip = getIPAddress();

    expect(typeof ip).toBe('string');
  });

  it('如果找到IP地址，应该是有效的IPv4格式', () => {
    const ip = getIPAddress();

    if (ip) {
      // 验证IPv4格式：xxx.xxx.xxx.xxx
      const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
      expect(ip).toMatch(ipv4Regex);

      // 验证每个部分都在0-255范围内
      const parts = ip.split('.');
      parts.forEach((part) => {
        const num = parseInt(part, 10);
        expect(num).toBeGreaterThanOrEqual(0);
        expect(num).toBeLessThanOrEqual(255);
      });
    }
  });

  it('不应该返回回环地址', () => {
    const ip = getIPAddress();

    expect(ip).not.toBe('127.0.0.1');
  });

  it('多次调用应该返回相同的结果', () => {
    const ip1 = getIPAddress();
    const ip2 = getIPAddress();

    expect(ip1).toBe(ip2);
  });
});
