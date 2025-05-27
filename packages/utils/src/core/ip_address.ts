import os from 'node:os';

/**
 * 获取当前主机的局域网 IPv4 地址。
 *
 * @remarks
 * 优先返回非回环地址 (`127.0.0.1`) 且为外部可访问的 IPv4 地址。
 * 若有多个网卡，会返回第一个符合条件的地址。
 *
 * @returns 返回本机的局域网 IPv4 地址，例如 `192.168.1.100`。
 * 如果找不到有效地址，返回空字符串。
 *
 * @example
 * ```ts
 * const ip = getIPAddress();
 * console.log(`Local IP: ${ip}`);
 * ```
 */
export function getIPAddress(): string {
  const interfaces = os.networkInterfaces();

  for (const devName in interfaces) {
    const iface = interfaces[devName];
    if (!iface) continue;

    for (const alias of iface) {
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }

  return '';
}
