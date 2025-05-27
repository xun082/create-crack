# Create Crack

🚀 一个现代化的项目脚手架工具，帮助你快速创建 React 项目。

## ✨ 特性

- 🎯 **多模板支持** - React + JavaScript/TypeScript 项目模板
- 📦 **多包管理器支持** - npm、yarn、pnpm、cnpm
- 🔍 **ESLint 集成** - 可选的代码检查和格式化
- 📝 **Commit Lint** - 可选的提交信息规范
- 🔄 **动态版本更新** - 自动获取最新的包版本
- 💻 **交互式 & 命令行模式** - 灵活的使用方式
- 🎨 **美观的 UI** - 现代化的命令行界面

## 📦 安装

### 全局安装

```bash
# 使用 npm
npm install -g create-crack

# 使用 yarn
yarn global add create-crack

# 使用 pnpm
pnpm add -g create-crack
```

### 直接使用（推荐）

无需安装，直接使用包管理器运行：

```bash
# 使用 npx (npm 5.2+)
npx create-crack my-app

# 使用 yarn
yarn create crack my-app

# 使用 pnpm
pnpm create crack my-app

# 使用 cnpm
cnpx create-crack my-app
```

## 🚀 快速开始

### 交互式模式

最简单的使用方式，工具会引导你完成所有配置：

```bash
npx create-crack my-app
```

然后按照提示选择：

1. 🎯 项目类型（React + JS 或 React + TS）
2. 📦 包管理器（npm/yarn/pnpm/cnpm）
3. 🔍 是否启用 ESLint
4. 📝 是否启用 Commit Lint

### 命令行模式

如果你知道具体配置，可以直接通过参数指定：

```bash
# 创建 TypeScript 项目，使用 pnpm，启用所有功能
npx create-crack my-app -t react-web-ts -p pnpm -e -c

# 创建 JavaScript 项目，使用 npm，只启用 ESLint
npx create-crack my-app --template react-web-js --package-manager npm --eslint
```

## 📋 命令行选项

| 选项                | 简写 | 描述                 | 可选值                         |
| ------------------- | ---- | -------------------- | ------------------------------ |
| `--template`        | `-t` | 项目模板             | `react-web-js`, `react-web-ts` |
| `--package-manager` | `-p` | 包管理器             | `npm`, `yarn`, `pnpm`, `cnpm`  |
| `--eslint`          | `-e` | 启用 ESLint          | -                              |
| `--commit-lint`     | `-c` | 启用 Commit Lint     | -                              |
| `--no-eslint`       | -    | 禁用 ESLint          | -                              |
| `--no-commit-lint`  | -    | 禁用 Commit Lint     | -                              |
| `--force`           | `-f` | 强制覆盖已存在的目录 | -                              |
| `--help`            | `-h` | 显示帮助信息         | -                              |
| `--version`         | `-V` | 显示版本号           | -                              |

## 🎯 项目模板

### React + JavaScript (`react-web-js`)

- ⚛️ React 19.x
- 📦 现代化的构建配置
- 🎨 Prettier 代码格式化
- 🔧 开发服务器和构建脚本

### React + TypeScript (`react-web-ts`)

- ⚛️ React 19.x + TypeScript
- 🔷 完整的类型定义
- 📦 现代化的构建配置
- 🎨 Prettier 代码格式化
- 🔧 开发服务器和构建脚本

## 📦 包管理器使用指南

### NPM

```bash
# 直接使用 npx（推荐）
npx create-crack my-app

# 全局安装后使用
npm install -g create-crack
create-crack my-app

# 指定包管理器
npx create-crack my-app --package-manager npm
```

### Yarn

```bash
# 使用 yarn create（推荐）
yarn create crack my-app

# 全局安装后使用
yarn global add create-crack
create-crack my-app

# 指定包管理器
yarn create crack my-app --package-manager yarn
```

### PNPM

```bash
# 使用 pnpm create（推荐）
pnpm create crack my-app

# 全局安装后使用
pnpm add -g create-crack
create-crack my-app

# 指定包管理器
pnpm create crack my-app --package-manager pnpm
```

### CNPM

```bash
# 使用 cnpx
cnpx create-crack my-app

# 全局安装后使用
cnpm install -g create-crack
create-crack my-app

# 指定包管理器
cnpx create-crack my-app --package-manager cnpm
```

## 💡 使用示例

### 基础使用

```bash
# 交互式创建项目
npx create-crack my-react-app
```

### 快速创建不同类型的项目

```bash
# TypeScript 项目 + 完整配置
npx create-crack my-ts-app -t react-web-ts -p pnpm -e -c

# JavaScript 项目 + 基础配置
npx create-crack my-js-app -t react-web-js -p npm

# 最小化项目（无额外工具）
npx create-crack my-minimal-app -t react-web-js -p yarn --no-eslint --no-commit-lint
```

### 团队开发推荐配置

```bash
# 推荐的团队开发配置
npx create-crack team-project \
  --template react-web-ts \
  --package-manager pnpm \
  --eslint \
  --commit-lint
```

## 🔧 项目结构

创建的项目将包含以下结构：

```
my-app/
├── src/
│   ├── App.jsx/tsx          # 主应用组件
│   └── index.jsx/tsx        # 入口文件
├── public/
│   └── index.html           # HTML 模板
├── package.json             # 项目配置
├── .gitignore              # Git 忽略文件
├── .prettierrc             # Prettier 配置
├── eslint.config.mjs       # ESLint 配置（可选）
├── commitlint.config.js    # Commit Lint 配置（可选）
└── README.md               # 项目说明
```

## 🚀 开发命令

创建项目后，你可以使用以下命令：

```bash
# 进入项目目录
cd my-app

# 启动开发服务器
npm start        # 或 yarn start / pnpm start

# 构建生产版本
npm run build    # 或 yarn build / pnpm build

# 代码检查（如果启用了 ESLint）
npm run lint     # 或 yarn lint / pnpm lint
```

## 🔍 ESLint 配置

如果选择启用 ESLint，项目将包含：

- 📋 **现代化规则集** - 适用于 React 和 TypeScript
- 🎨 **Prettier 集成** - 代码格式化
- 🔧 **自动修复** - `npm run lint` 自动修复问题
- 📝 **Git Hooks** - 提交前自动检查（如果启用 Commit Lint）

## 📝 Commit Lint 配置

如果选择启用 Commit Lint，项目将包含：

- 📋 **约定式提交** - 标准化的提交信息格式
- 🎯 **提交类型** - feat, fix, docs, style, refactor 等
- 🔧 **Git Hooks** - 提交时自动验证
- 📝 **交互式提交** - 引导式提交信息编写

### 提交信息格式

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

示例：

```bash
feat(auth): add user login functionality
fix(ui): resolve button alignment issue
docs(readme): update installation guide
```

## 🔄 版本更新

工具会自动获取以下包的最新版本：

- `@verve-kit/react-script` - 自有构建工具
- 其他依赖保持稳定版本以确保兼容性

## 🐛 故障排除

### 常见问题

1. **网络问题**

   ```bash
   # 使用国内镜像
   npx create-crack my-app --registry https://registry.npmmirror.com
   ```

2. **权限问题**

   ```bash
   # 使用 sudo（macOS/Linux）
   sudo npx create-crack my-app
   ```

3. **缓存问题**
   ```bash
   # 清除 npx 缓存
   npx clear-npx-cache
   npx create-crack@latest my-app
   ```

### 获取帮助

```bash
# 查看帮助信息
npx create-crack --help

# 查看版本信息
npx create-crack --version
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [GitHub 仓库](https://github.com/xun082/create-crack)
- [NPM 包](https://www.npmjs.com/package/create-crack)
- [问题反馈](https://github.com/xun082/create-crack/issues)

---

**Happy Coding! 🎉**
