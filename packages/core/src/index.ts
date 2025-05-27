#!/usr/bin/env node

import { Command } from 'commander';
import kleur from 'kleur';

import createApp from './core/create_app.js';
import getPackageJsonInfo from './core/package_info.js';

const program = new Command();

program
  .version(kleur.green(getPackageJsonInfo('../package.json', true).version || '1.0.0'))
  .arguments('<project-name>')
  .description(kleur.cyan('Create a directory for your project files'))
  .option('-f, --force', 'Overwrite target directory if it exists')
  .option('-t, --template <template>', 'Project template (react-web-js | react-web-ts)')
  .option('-p, --package-manager <manager>', 'Package manager (npm | yarn | pnpm | cnpm)')
  .option('-e, --eslint', 'Enable ESLint configuration')
  .option('-c, --commit-lint', 'Enable Commit Lint configuration')
  .option('--no-eslint', 'Disable ESLint configuration')
  .option('--no-commit-lint', 'Disable Commit Lint configuration')
  .addHelpText(
    'after',
    `

${kleur.yellow('Examples:')}
  ${kleur.gray('# Interactive mode (default)')}
  $ create-crack my-app

  ${kleur.gray('# Non-interactive mode with all options')}
  $ create-crack my-app -t react-web-ts -p pnpm -e -c

  ${kleur.gray('# Create React JS project with npm and ESLint')}
  $ create-crack my-app --template react-web-js --package-manager npm --eslint

  ${kleur.gray('# Create project without ESLint and Commit Lint')}
  $ create-crack my-app -t react-web-ts -p yarn --no-eslint --no-commit-lint

${kleur.yellow('Available Templates:')}
  ${kleur.cyan('react-web-js')}   - React + JavaScript Web应用程序
  ${kleur.cyan('react-web-ts')}   - React + TypeScript Web应用程序

${kleur.yellow('Available Package Managers:')}
  ${kleur.cyan('npm')}   - Node Package Manager
  ${kleur.cyan('yarn')}  - Yarn Package Manager  
  ${kleur.cyan('pnpm')}  - PNPM Package Manager
  ${kleur.cyan('cnpm')}  - CNPM Package Manager
`,
  )
  .action((name, options) => {
    createApp(name, options);
  })
  .parse(process.argv);
