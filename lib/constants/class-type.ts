export type ClassType = 'group' | 'private'

export interface ClassTypeConfig {
  label: string
  className: string
}

export const CLASS_TYPE_CONFIG: Record<ClassType, ClassTypeConfig> = {
  group: {
    label: '그룹',
    className: 'bg-blue-50 text-blue-700',
  },
  private: {
    label: '프라이빗',
    className: 'bg-purple-50 text-purple-700',
  },
}
