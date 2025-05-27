# Create Crack CLI

🚀 一个现代化的项目脚手架工具，帮助你快速创建 React 项目。

## 📦 Monorepo 结构

这是一个基于 Turborepo 的 monorepo 项目，包含以下包：

```
cli/
├── packages/
│   ├── core/                 # 核心脚手架工具
│   ├── utils/               # 工具函数库
│   ├── webpack-react/       # Webpack React 配置
│   └── eslint/              # ESLint 配置
└── README.md               # 项目说明
```

## 🚀 快速开始

### 直接使用（推荐）

```bash
# 使用 npx
npx create-crack my-app

# 使用 yarn
yarn create crack my-app

# 使用 pnpm
pnpm create crack my-app
```

### 开发环境设置

```bash
# 克隆项目
git clone <repository-url>
cd cli

# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 开发模式
pnpm dev
```

## 📋 可用脚本

```bash
# 构建所有包
pnpm build

# 开发模式（监听文件变化）
pnpm dev

# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 清理构建文件
pnpm clean

# 运行测试
pnpm test
```

## 📦 包说明

### @laconic/core

核心脚手架工具，提供项目创建功能。

**特性：**

- 🎯 多模板支持（React + JS/TS）
- 📦 多包管理器支持
- 🔍 ESLint 集成
- 📝 Commit Lint 支持
- 🔄 动态版本更新

### @verve-kit/utils

通用工具函数库。

### @laconic/webpack-react

React 项目的 Webpack 配置。

### @laconic/eslint

ESLint 配置预设。

## 🔧 开发指南

### 添加新包

```bash
# 在 packages 目录下创建新包
mkdir packages/new-package
cd packages/new-package

# 初始化 package.json
pnpm init
```

### 包间依赖

```bash
# 在 core 包中添加 utils 依赖
pnpm --filter @laconic/core add @verve-kit/utils
```

### 发布流程

本项目使用 Changesets 进行自动化版本管理和发布。详细说明请查看 [RELEASE.md](./RELEASE.md)。

```bash
# 创建 changeset
pnpm changeset

# 手动发布（如需要）
pnpm release
```

## 🛠️ 技术栈

- **构建工具**: Turborepo + Rollup
- **语言**: TypeScript
- **包管理**: PNPM
- **代码规范**: ESLint + Prettier
- **提交规范**: Commitlint + Husky

## 📖 详细文档

- [Core 包文档](./packages/core/Readme.md)
- [Utils 包文档](./packages/utils/README.md)
- [Webpack React 包文档](./packages/webpack-react/README.md)
- [ESLint 包文档](./packages/eslint/README.md)

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 提交信息规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**类型 (type):**

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式化
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

- [NPM 包](https://www.npmjs.com/package/create-crack)
- [问题反馈](https://github.com/xun082/create-crack/issues)
- [更新日志](CHANGELOG.md)

---

**Happy Coding! 🎉**
