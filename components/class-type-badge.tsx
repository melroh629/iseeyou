import { Badge } from '@/components/ui/badge'
import { CLASS_TYPE_CONFIG, ClassType } from '@/lib/constants/class-type'

interface ClassTypeBadgeProps {
  type: string
}

export function ClassTypeBadge({ type }: ClassTypeBadgeProps) {
  const config = CLASS_TYPE_CONFIG[type as ClassType] || CLASS_TYPE_CONFIG.group

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}
