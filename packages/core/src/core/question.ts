interface ISelectType {
  value: string;
  label: string;
  hint?: string;
}

function createSelectType(value: string, hint?: string): ISelectType {
  const result: ISelectType = { value, label: value };

  if (hint !== undefined) {
    result.hint = hint;
  }

  return result;
}

// 优化后只保留两个可用的模板库
export const ProjectTypes: ISelectType[] = [
  createSelectType('react-web-js', 'React + JavaScript Web应用程序 🚀'),
  createSelectType('react-web-ts', 'React + TypeScript Web应用程序 🚀'),
];

export const PackageManagers: ISelectType[] = [
  { value: 'npm', label: 'npm' },
  { value: 'yarn', label: 'yarn' },
  { value: 'pnpm', label: 'pnpm' },
  { value: 'cnpm', label: 'cnpm' },
];
