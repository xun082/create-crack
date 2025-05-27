import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { type Configuration } from 'webpack';
import { resolveApp } from '@verve-kit/utils';

/**
 * 用户配置加载器上下文
 */
export interface ConfigContext {
  /** 当前模式：development | production */
  mode: string | undefined;
  /** 是否为开发环境 */
  isDevelopment: boolean;
  /** 环境变量对象（包含用户的 .env 文件和系统环境变量） */
  env: Record<string, string | undefined>;
}

/**
 * 用户配置类型：可以是对象或返回对象的函数
 */
export type UserConfig =
  | Configuration
  | ((context: ConfigContext) => Configuration | Promise<Configuration>);

/**
 * 优雅的 Webpack 用户配置加载器
 *
 * 支持的配置文件格式：
 * - webpack.config.ts
 * - webpack.config.js
 * - webpack.config.mjs
 * - webpack.config.mts
 *
 * @example
 * ```typescript
 * // 基本使用
 * const loader = new WebpackConfigLoader();
 * const config = await loader.load();
 *
 * // 带上下文
 * const config = await loader.load({
 *   mode: 'development',
 *   isDevelopment: true,
 *   env: process.env
 * });
 * ```
 */
export class WebpackConfigLoader {
  private static readonly CONFIG_FILES = [
    'webpack.config.ts',
    'webpack.config.js',
    'webpack.config.mjs',
    'webpack.config.mts',
  ] as const;

  private configCache: Configuration | null = null;
  private configPath: string | null = null;
  private readonly enableCache: boolean;

  constructor(options: { enableCache?: boolean } = {}) {
    this.enableCache = options.enableCache ?? true;
  }

  /**
   * 查找用户配置文件
   */
  private findConfigFile(): string | null {
    if (this.configPath) return this.configPath;

    this.configPath =
      WebpackConfigLoader.CONFIG_FILES.map((file) => resolveApp(`./${file}`)).find(fs.existsSync) ??
      null;

    return this.configPath;
  }

  /**
   * 验证配置对象
   */
  private validateConfig(config: unknown): config is Configuration {
    return config !== null && typeof config === 'object';
  }

  /**
   * 动态导入并解析用户配置
   */
  private async importConfig(configPath: string, context: ConfigContext): Promise<Configuration> {
    try {
      // 清除模块缓存（开发环境支持热重载）
      if (!this.enableCache && typeof require !== 'undefined' && require.cache) {
        delete require.cache[configPath];
      }

      const configModule = await import(pathToFileURL(configPath).href);
      let config = configModule.default ?? configModule;

      // 支持函数式配置
      if (typeof config === 'function') {
        config = await config(context);
      }

      // 验证配置
      if (!this.validateConfig(config)) {
        throw new Error('Configuration must be an object or a function that returns an object');
      }

      if (context.isDevelopment) {
        console.log(`✅ Loaded webpack config from: ${configPath}`);
      }

      return config;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`⚠️  Failed to load webpack config from ${configPath}: ${errorMessage}`);
      throw new Error(`Invalid webpack configuration: ${errorMessage}`);
    }
  }

  /**
   * 加载用户配置
   *
   * @param context 配置上下文
   * @returns 用户配置对象，如果没有找到配置文件则返回 null
   */
  async load(context: ConfigContext): Promise<Configuration | null> {
    // 开发环境或禁用缓存时重新加载
    if (!this.enableCache || context.isDevelopment || !this.configCache) {
      const configPath = this.findConfigFile();

      if (!configPath) {
        this.configCache = null;

        return null;
      }

      this.configCache = await this.importConfig(configPath, context);
    }

    return this.configCache;
  }

  /**
   * 清除缓存（用于测试或强制重新加载）
   */
  clearCache(): void {
    this.configCache = null;
    this.configPath = null;
  }

  /**
   * 获取当前配置文件路径
   */
  getConfigPath(): string | null {
    return this.findConfigFile();
  }

  /**
   * 检查是否存在用户配置文件
   */
  hasUserConfig(): boolean {
    return this.findConfigFile() !== null;
  }
}

/**
 * 创建默认的配置加载器实例
 */
export function createConfigLoader(options?: { enableCache?: boolean }): WebpackConfigLoader {
  return new WebpackConfigLoader(options);
}
