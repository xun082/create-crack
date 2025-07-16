import { createLibraryConfig } from '../../rollup.base.mjs';
import copy from 'rollup-plugin-copy';

// 使用新的简化配置函数
export default createLibraryConfig(import.meta.url, {
  copyPlugin: copy({
    targets: [{ src: 'src/package', dest: 'dist' }],
  }),
});
