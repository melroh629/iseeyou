// 공통 스케줄 관련 타입 정의

export interface TimeSlot {
  start_time: string
  end_time: string
}

export interface SpecificDate {
  date: string
  times: TimeSlot[]
}

export interface WeeklyPattern {
  [key: string]: TimeSlot[]
}

export type ScheduleMode = 'basic' | 'advanced'

export type ClassType = 'group' | 'private'

export interface DayInfo {
  key: string
  label: string
}

export const DAYS: DayInfo[] = [
  { key: 'monday', label: '월' },
  { key: 'tuesday', label: '화' },
  { key: 'wednesday', label: '수' },
  { key: 'thursday', label: '목' },
  { key: 'friday', label: '금' },
  { key: 'saturday', label: '토' },
  { key: 'sunday', label: '일' },
]

export const COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#84cc16', // lime
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#ec4899', // pink
]
