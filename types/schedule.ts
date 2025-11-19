/**
 * 스케줄 관련 타입 정의
 */

export interface Class {
  id: string
  name: string
  color: string | null
}

export interface Booking {
  id: string
  status: 'confirmed' | 'completed' | 'cancelled'
  students?: {
    users: {
      name: string
      phone: string
    }
  }
}

export interface Schedule {
  id: string
  date: string
  start_time: string
  end_time: string
  type: 'group' | 'private'
  max_students: number | null
  status: 'scheduled' | 'completed' | 'cancelled'
  classes: Class
  bookings?: Booking[]
  _count?: {
    bookings: number
  }
  isBooked?: boolean
}

export interface ScheduleWithBookingCount extends Omit<Schedule, 'bookings'> {
  _count: {
    bookings: number
  }
}
