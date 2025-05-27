# @laconic/react-script

优雅的 React + Webpack 开发工具包，支持 TypeScript、CSS Modules、热重载等现代化开发特性。

## 🚀 快速开始

```bash
npm install @laconic/react-script
```

**无需额外安装 webpack 相关依赖！** 本包已内置所有必要的 webpack、babel、loader 等依赖。

### 基本使用

安装后，你可以直接在项目中使用：

```bash
# 开发模式
npx react-script-crack start

# 生产构建
npx react-script-crack build
```

如果需要自定义配置，只需在项目根目录创建配置文件即可。

## ✨ 特性

- 🚀 **零配置启动**：开箱即用，无需复杂配置
- 📦 **内置依赖**：包含所有必要的 webpack、babel、loader
- 🔧 **灵活配置**：支持自定义 webpack 配置
- 🌍 **环境变量**：自动读取 .env 文件
- 🔥 **热重载**：开发环境支持热重载
- 📱 **现代化**：支持 TypeScript、CSS Modules、ES6+

## 📦 自定义 Webpack 配置

本工具包支持多种方式自定义 Webpack 配置，让你可以根据项目需求灵活调整构建行为。

## 🌍 环境变量支持

工具包会自动读取以下环境变量文件（按优先级排序）：

1. `.env.${NODE_ENV}` (如 `.env.development`, `.env.production`)
2. `.env`

### 环境变量规则

- **REACT*APP*** 前缀的变量会自动注入到客户端代码中
- 支持变量展开（如 `API_URL=$BASE_URL/api`）
- 用户配置函数可以访问所有环境变量

### 示例 .env 文件

```bash
# .env.development
NODE_ENV=development
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_DEBUG=true
API_PROXY_TARGET=http://localhost:8080
DEV_PORT=3000
AUTO_OPEN=true

# .env.production
NODE_ENV=production
REACT_APP_API_URL=https://api.example.com
REACT_APP_DEBUG=false
USE_CDN=true
ANALYZE=false
```

### 支持的配置文件

在项目根目录创建以下任一配置文件（按优先级排序）：

- `webpack.config.ts` （推荐，支持 TypeScript）
- `webpack.config.js`
- `webpack.config.mjs`
- `webpack.config.mts`

### 配置方式

> **注意**：用户项目中无需安装 webpack 相关依赖，所有依赖已内置在 `@laconic/react-script` 中。配置文件中不要导入 webpack 相关模块。

#### 1. 对象式配置

```typescript
// webpack.config.ts
import path from 'path';

export default {
  // 路径别名配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
    },
  },

  // 自定义入口文件（可选）
  entry: './src/main.tsx',

  // 输出配置（可选）
  output: {
    filename: 'bundle.[contenthash].js',
  },
};
```

#### 2. 函数式配置（推荐）

函数式配置更加灵活，可以根据环境动态生成配置：

```typescript
// webpack.config.ts
import path from 'path';
import type { ConfigContext } from '@laconic/react-script';

export default ({ isDevelopment, env }: ConfigContext) => ({
  // 路径别名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
    },
  },

  // 开发服务器代理
  ...(isDevelopment && {
    devServer: {
      proxy: {
        '/api': {
          target: env.API_PROXY_TARGET ?? 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
  }),
});
```

#### 3. 异步配置

支持异步函数配置，可以动态加载配置：

```typescript
// webpack.config.ts
import type { ConfigContext } from '@laconic/react-script';

export default async ({ isDevelopment }: ConfigContext) => {
  // 异步加载配置
  const dynamicConfig = await import('./config/webpack.dynamic.js');

  return {
    ...dynamicConfig.default,
    // 根据环境动态配置
    devtool: isDevelopment ? 'eval-source-map' : 'source-map',
  };
};
```

### 配置上下文 (ConfigContext)

函数式配置会接收一个上下文对象，包含以下属性：

```typescript
interface ConfigContext {
  /** 当前模式：'development' | 'production' */
  mode: string | undefined;

  /** 是否为开发环境 */
  isDevelopment: boolean;

  /** 环境变量对象（包含用户的 .env 文件和系统环境变量） */
  env: Record<string, string | undefined>;
}
```

## 🔧 高级特性

- **智能合并**：使用 `webpack-merge` 智能合并用户配置和默认配置
- **缓存优化**：生产环境启用缓存，开发环境支持热重载
- **错误处理**：配置加载失败时自动回退到默认配置
- **类型安全**：完整的 TypeScript 类型支持

## 🐛 常见问题

**Q: 配置文件不生效？**  
A: 确保配置文件在项目根目录，文件名正确（如 `webpack.config.ts`）

**Q: 能否在配置文件中导入 webpack？**  
A: 不可以！用户项目中没有 webpack 依赖。所有 webpack 功能已内置，配置文件中只需导出配置对象即可

**Q: TypeScript 类型错误？**  
A: 配置文件使用普通对象即可，无需 webpack 类型。如需类型提示可安装 `@types/webpack`（可选）

**Q: 修改配置后不生效？**  
A: 开发环境下修改配置文件需要重启开发服务器

## 📄 许可证

MIT
