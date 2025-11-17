import { CLASS_TYPE_CONFIG, ClassType } from '@/lib/constants/class-type'

interface ClassTypeBadgeProps {
  type: string
}

export function ClassTypeBadge({ type }: ClassTypeBadgeProps) {
  const config = CLASS_TYPE_CONFIG[type as ClassType] || CLASS_TYPE_CONFIG.group

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${config.className}`}
    >
      {config.label}
    </span>
  )
}
