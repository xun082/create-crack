import { PackageJsonType } from '../types';
import getPackageJsonInfo from './package_json_info';
import { resolveApp } from './resolveApp';

function useCssPreset(preset: string) {
  const packageInfo = getPackageJsonInfo(resolveApp('./package.json'), false) as PackageJsonType;

  return packageInfo.dependencies?.[preset] || packageInfo.devDependencies?.[preset];
}

export { useCssPreset };
