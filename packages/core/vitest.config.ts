import { mergeConfig } from 'vitest/config';

import baseConfig from '../../vitest.config';

export default mergeConfig(baseConfig, {
  test: {
    // 只覆盖或追加想改的内容
    environment: 'node',
    setupFiles: './tests/setupTests.ts',
    include: ['tests/**/*.test.ts'],
  },
});
