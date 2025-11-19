/**
 * 수강권(Enrollment) 관련 타입 정의
 */

export interface Enrollment {
  id: string
  name: string
  total_count: number
  used_count: number
  valid_from: string
  valid_until: string
  status: 'active' | 'expired' | 'suspended'
  classes: {
    id: string
    name: string
    color: string | null
  }
}

export interface EnrollmentStudent {
  id: string
  used_count: number
  users: {
    name: string
    phone: string
  }
}

export interface EnrollmentWithStudents extends Enrollment {
  students: EnrollmentStudent[]
}
