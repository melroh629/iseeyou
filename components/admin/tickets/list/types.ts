export interface EnrollmentStudent {
  id: string
  used_count: number
  users: {
    name: string
    phone: string
  }
}

export interface Enrollment {
  id: string
  name: string
  total_count: number
  used_count: number
  valid_from: string
  valid_until: string
  price: number | null
  status: 'active' | 'expired' | 'suspended'
  created_at: string
  students: EnrollmentStudent[]
  classes: {
    id: string
    name: string
    type: string
  }
}

export interface Student {
  id: string
  users: {
    name: string
    phone: string
  }
}

export interface ClassType {
  id: string
  name: string
  type: string
}

export interface EditForm {
  name: string
  totalCount: number
  validFrom: string
  validUntil: string
  price: number
  status: 'active' | 'expired' | 'suspended'
}
