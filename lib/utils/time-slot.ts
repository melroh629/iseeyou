import { TimeSlot, SpecificDate, WeeklyPattern } from '@/lib/types/schedule'

// 시작 시간에 1시간 더하기 (HH:MM 형식)
export const addOneHour = (startTime: string): string => {
  const [hours, minutes] = startTime.split(':').map(Number)
  const newHours = (hours + 1) % 24 // 24시간 넘으면 0으로
  return `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

// 시간대 업데이트
export const updateTimeSlot = (
  timeSlots: TimeSlot[],
  index: number,
  field: 'start_time' | 'end_time',
  value: string
): TimeSlot[] => {
  const newSlots = [...timeSlots]
  let updatedSlot = { ...newSlots[index], [field]: value }

  // 시작 시간 변경 시 자동으로 종료 시간 +1시간 설정
  if (field === 'start_time' && value) {
    updatedSlot.end_time = addOneHour(value)
  }

  // 시작 시간 >= 종료 시간 체크
  if (updatedSlot.start_time && updatedSlot.end_time && updatedSlot.start_time >= updatedSlot.end_time) {
    alert('종료 시간은 시작 시간보다 늦어야 합니다.')
    return timeSlots // 변경 취소
  }

  newSlots[index] = updatedSlot
  return newSlots
}

// 시간대 추가
export const addTimeSlot = (
  timeSlots: TimeSlot[],
  defaultTime: TimeSlot = { start_time: '09:00', end_time: '10:00' }
): TimeSlot[] => {
  return [...timeSlots, defaultTime]
}

// 시간대 제거
export const removeTimeSlot = (
  timeSlots: TimeSlot[],
  index: number
): TimeSlot[] => {
  return timeSlots.filter((_, i) => i !== index)
}

// 특정 날짜의 시간 업데이트
export const updateTimeForDate = (
  dates: SpecificDate[],
  dateStr: string,
  timeIndex: number,
  field: 'start_time' | 'end_time',
  value: string
): SpecificDate[] => {
  return dates.map((d) => {
    if (d.date === dateStr) {
      const newTimes = [...d.times]
      let updatedTime = { ...newTimes[timeIndex], [field]: value }

      // 시작 시간 변경 시 자동으로 종료 시간 +1시간 설정
      if (field === 'start_time' && value) {
        updatedTime.end_time = addOneHour(value)
      }

      // 시작 시간 >= 종료 시간 체크
      if (updatedTime.start_time && updatedTime.end_time && updatedTime.start_time >= updatedTime.end_time) {
        alert('종료 시간은 시작 시간보다 늦어야 합니다.')
        return d // 변경 취소
      }

      newTimes[timeIndex] = updatedTime
      return { ...d, times: newTimes }
    }
    return d
  })
}

// 특정 날짜에 시간 추가
export const addTimeToDate = (
  dates: SpecificDate[],
  dateStr: string,
  defaultTime: TimeSlot = { start_time: '09:00', end_time: '10:00' }
): SpecificDate[] => {
  return dates.map((d) =>
    d.date === dateStr ? { ...d, times: [...d.times, defaultTime] } : d
  )
}

// 특정 날짜의 시간 제거
export const removeTimeFromDate = (
  dates: SpecificDate[],
  dateStr: string,
  timeIndex: number
): SpecificDate[] => {
  return dates
    .map((d) => {
      if (d.date === dateStr) {
        const newTimes = d.times.filter((_, i) => i !== timeIndex)
        return newTimes.length === 0 ? null : { ...d, times: newTimes }
      }
      return d
    })
    .filter((d) => d !== null) as SpecificDate[]
}

// 날짜 토글 (선택/해제)
export const toggleDate = (
  dates: SpecificDate[],
  dateStr: string,
  defaultTime: TimeSlot = { start_time: '09:00', end_time: '10:00' }
): SpecificDate[] => {
  const existing = dates.find((d) => d.date === dateStr)

  if (existing) {
    return dates.filter((d) => d.date !== dateStr)
  } else {
    return [...dates, { date: dateStr, times: [defaultTime] }]
  }
}

// 날짜 범위 생성
export const generateDateRange = (
  startDate: string,
  endDate: string
): string[] => {
  if (!startDate || !endDate) return []

  const start = new Date(startDate)
  const end = new Date(endDate)
  const dates: string[] = []

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d).toISOString().split('T')[0])
  }

  return dates
}

// 요일 패턴에서 시간 업데이트
export const updateWeeklyPatternTime = (
  pattern: WeeklyPattern,
  dayKey: string,
  index: number,
  field: 'start_time' | 'end_time',
  value: string
): WeeklyPattern => {
  const slots = pattern[dayKey] || []
  const newSlots = updateTimeSlot(slots, index, field, value)
  return {
    ...pattern,
    [dayKey]: newSlots,
  }
}

// 요일 패턴에 시간 추가
export const addWeeklyPatternTime = (
  pattern: WeeklyPattern,
  dayKey: string,
  defaultTime: TimeSlot = { start_time: '09:00', end_time: '10:00' }
): WeeklyPattern => {
  const slots = pattern[dayKey] || []
  return {
    ...pattern,
    [dayKey]: addTimeSlot(slots, defaultTime),
  }
}

// 요일 패턴에서 시간 제거
export const removeWeeklyPatternTime = (
  pattern: WeeklyPattern,
  dayKey: string,
  index: number
): { pattern: WeeklyPattern; shouldRemoveDay: boolean } => {
  const slots = pattern[dayKey] || []
  const newSlots = removeTimeSlot(slots, index)

  if (newSlots.length === 0) {
    const newPattern = { ...pattern }
    delete newPattern[dayKey]
    return { pattern: newPattern, shouldRemoveDay: true }
  }

  return {
    pattern: { ...pattern, [dayKey]: newSlots },
    shouldRemoveDay: false,
  }
}
