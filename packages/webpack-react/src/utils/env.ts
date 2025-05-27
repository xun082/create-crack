import * as fs from 'fs';
import { resolveApp } from '@verve-kit/utils';
import * as dotenvExpand from 'dotenv-expand';
import * as dotenv from 'dotenv';

// 获取环境变量
const NODE_ENV = process.env['NODE_ENV'];

// 定义 .env 文件列表
const dotenvFiles: string[] = [`${resolveApp('.env')}.${NODE_ENV}`, resolveApp('.env')].filter(
  Boolean,
);

const userConfigEnv: Record<string, string | undefined> = {};

dotenvFiles.forEach((dotenvFile) => {
  if (fs.existsSync(dotenvFile)) {
    // 加载并展开 .env 文件
    dotenvExpand.expand(
      dotenv.config({
        path: dotenvFile,
      }),
    );

    // 读取 .env 文件内容
    const res = fs.readFileSync(dotenvFile, 'utf-8');
    const dotEnvContent = res.split(/\n/).map((str) => str.split('=')[0]?.trim() || '');

    dotEnvContent.forEach((key) => {
      if (key !== '') userConfigEnv[key] = process.env[key];
    });
  }
});

const REACT_APP = /^REACT_APP_/i;

interface ClientEnv {
  stringified: {
    'process.env': Record<string, string>;
  };
  raw: Record<string, string | undefined>;
}

export default function getClientEnvironment(): ClientEnv {
  const raw: Record<string, string | undefined> = Object.keys(process.env)
    .filter((key) => REACT_APP.test(key))
    .reduce<Record<string, string | undefined>>(
      (env, key) => {
        env[key] = process.env[key];

        return env;
      },
      {
        NODE_ENV: process.env['NODE_ENV'] || 'development',
        WDS_SOCKET_HOST: process.env['WDS_SOCKET_HOST'],
        WDS_SOCKET_PATH: process.env['WDS_SOCKET_PATH'],
        WDS_SOCKET_PORT: process.env['WDS_SOCKET_PORT'],
        ...userConfigEnv,
      },
    );

  const stringified = {
    'process.env': Object.keys(raw).reduce<Record<string, string>>((env, key) => {
      const val = raw[key] ?? '';
      env[key] = JSON.stringify(val);

      return env;
    }, {}),
  };

  return { stringified, raw };
}
