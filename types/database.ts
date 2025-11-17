// Database Types - ISeeYou 아이씨유 독 트레이닝

export type UserRole = "admin" | "student";

export type ClassType = "private" | "group";

export type ClassStatus = "scheduled" | "cancelled" | "completed";

export type EnrollmentStatus = "active" | "expired" | "suspended";

export type BookingStatus = "confirmed" | "cancelled" | "completed";

// Users Table
export interface User {
  id: string; // UUID
  phone: string;
  name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// Students Table
export interface Student {
  id: string; // UUID
  user_id: string;
  dog_name: string | null;
  notes: string | null;
  created_at: string;
}

// Class Types Table
export interface ClassTypeRow {
  id: string; // UUID
  name: string;
  description: string | null;
  type: ClassType;
  default_max_students: number;
  default_cancel_hours: number;
  created_at: string;
}

// Classes Table
export interface Class {
  id: string; // UUID
  class_id: string;
  instructor_id: string;
  date: string; // DATE
  start_time: string; // TIME
  end_time: string; // TIME
  location_name: string | null;
  location_address: string | null;
  max_students: number;
  cancel_hours_before: number;
  status: ClassStatus;
  created_at: string;
}

// Enrollments Table
export interface Enrollment {
  id: string; // UUID
  student_id: string;
  class_id: string;
  name: string;
  total_count: number;
  used_count: number;
  valid_from: string; // DATE
  valid_until: string; // DATE
  price: number | null;
  status: EnrollmentStatus;
  created_at: string;
}

// Bookings Table
export interface Booking {
  id: string; // UUID
  class_id: string;
  enrollment_id: string;
  student_id: string;
  status: BookingStatus;
  booked_at: string;
  cancelled_at: string | null;
}

// Join Types (필요한 경우 관계 데이터 포함)
export interface ClassWithType extends Class {
  class_type: ClassTypeRow;
  instructor: User;
}

export interface BookingWithDetails extends Booking {
  class: ClassWithType;
  enrollment: Enrollment;
  student: Student;
}

export interface EnrollmentWithType extends Enrollment {
  class_type: ClassTypeRow;
}
