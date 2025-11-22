export interface TicketFormData {
  classId: string
  ticketType: 'count_based' | 'period_based'
  name: string
  color: string
  totalCount: number
  validFrom: string
  validUntil: string
  maxStudentsPerClass: number
  price: number
  weeklyLimit: number
  monthlyLimit: number
  autoDeductWeekly: boolean
  autoDeductMonthly: boolean
  classCategory: string
  noticeMessage: string
  bookingStartHoursBefore: number
  bookingEndHoursBefore: number
}

export interface ClassType {
  id: string
  name: string
  type: string
}

export interface Student {
  id: string
  users: {
    name: string
    phone: string
  }
}
