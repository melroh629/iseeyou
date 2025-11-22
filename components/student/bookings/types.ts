export interface Schedule {
  id: string
  date: string
  start_time: string
  end_time: string
  type: string
  max_students: number | null
  status: string
  classes: {
    id: string
    name: string
    color: string | null
  }
  _count?: {
    bookings: number
  }
  isBooked?: boolean
}

export interface Enrollment {
  id: string
  name: string
  total_count: number
  used_count: number
  status: string
  classes: {
    id: string
    name: string
  }
}
