import { mergeConfig } from 'vitest/config';

import baseConfig from '../../vitest.config';

export default mergeConfig(baseConfig, {
  test: {
    environment: 'node',
    setupFiles: './tests/setupTests.ts',
    include: ['tests/**/*.test.ts'],
  },
});
