/**
 * E2E 테스트로 생성된 데이터 정리 스크립트
 *
 * 사용법:
 *   npm run test:cleanup
 *
 * 또는:
 *   npx tsx tests/cleanup-e2e-data.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// .env.test 파일 로드
dotenv.config({ path: '.env.test' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ .env.test 파일에 NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 설정해주세요')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function cleanup() {
  console.log('🧹 E2E 테스트 데이터 정리 시작...\n')

  // E2E 테스트로 생성된 수강권 찾기
  const { data: testEnrollments, error: findError } = await supabase
    .from('enrollments')
    .select('id, name')
    .like('name', '%E2E%')

  if (findError) {
    console.error('❌ 수강권 조회 실패:', findError)
    process.exit(1)
  }

  if (!testEnrollments || testEnrollments.length === 0) {
    console.log('✅ 정리할 E2E 테스트 데이터가 없습니다')
    return
  }

  console.log(`📋 발견된 E2E 수강권: ${testEnrollments.length}개`)
  testEnrollments.forEach((e) => console.log(`  - ${e.name}`))

  const enrollmentIds = testEnrollments.map((e) => e.id)

  // 1. enrollment_students 삭제
  const { error: es_error } = await supabase
    .from('enrollment_students')
    .delete()
    .in('enrollment_id', enrollmentIds)

  if (es_error) {
    console.error('❌ enrollment_students 삭제 실패:', es_error)
  } else {
    console.log('✅ enrollment_students 삭제 완료')
  }

  // 2. reservations 삭제 (테이블이 존재하는 경우에만)
  const { error: res_error } = await supabase
    .from('reservations')
    .delete()
    .in('enrollment_id', enrollmentIds)

  if (res_error) {
    // PGRST205: 테이블이 없는 경우 무시 (아직 예약 기능 미구현)
    if (res_error.code !== 'PGRST205') {
      console.error('❌ reservations 삭제 실패:', res_error)
    }
  } else {
    console.log('✅ reservations 삭제 완료')
  }

  // 3. enrollments 삭제
  const { error: enr_error } = await supabase
    .from('enrollments')
    .delete()
    .in('id', enrollmentIds)

  if (enr_error) {
    console.error('❌ enrollments 삭제 실패:', enr_error)
  } else {
    console.log('✅ enrollments 삭제 완료')
  }

  console.log(`\n🎉 테스트 정리 완료: ${testEnrollments.length}개 수강권 삭제됨`)
}

cleanup()
