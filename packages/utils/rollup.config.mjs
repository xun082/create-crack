import { createLibraryConfig } from '../../rollup.base.mjs';

// 使用新的简化配置函数
export default createLibraryConfig(import.meta.url);
