import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'

test.describe('관리자 수강권 관리', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('미할당 수강권 생성', async ({ page }) => {
    // API 응답 감시
    let apiResponse: any = null
    page.on('response', async (response) => {
      if (response.url().includes('/api/admin/enrollments') && response.request().method() === 'POST') {
        apiResponse = await response.json()
        console.log('=== 수강권 생성 API 응답 ===')
        console.log(JSON.stringify(apiResponse, null, 2))
      }
    })

    // 수강권 생성 페이지로 이동
    await page.goto('/admin/tickets/new')

    // 페이지 완전히 로드될 때까지 대기
    await page.waitForLoadState('networkidle')

    // 페이지 로드 확인
    await expect(page.locator('h1', { hasText: '수강권 등록' })).toBeVisible({ timeout: 10000 })

    // 1. 수업 종류 선택 (첫 번째 수업 선택)
    // Radix UI Select - 먼저 트리거를 클릭하고 option을 선택
    const classTypeSelect = page.locator('button').filter({ hasText: '수업 종류를 선택하세요' }).first()
    await classTypeSelect.click()

    // 첫 번째 수업 선택 (getByRole을 사용하여 SelectItem 선택)
    await page.getByRole('option').first().click()

    // 2. 수강권 종류 선택 (회수제)
    // 이미 기본값이 "회수제"로 되어 있음 (ticketType: 'count_based')

    // 3. 수강권 명칭
    const ticketName = `E2E 테스트 수강권 ${Date.now()}`
    await page.locator('input[placeholder*="캐니크로스"]').fill(ticketName)

    // 4. 색상 선택 (파란색 - #3b82f6, 기본값)
    // 기본값으로 설정되어 있으므로 스킵 가능

    // 5. 이용횟수 설정 (기본값 10회 사용)
    // 기본값이 10이므로 스킵

    // 6. 수강권 사용기간 설정
    const today = new Date()
    const futureDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000) // 90일 후
    const endDate = futureDate.toISOString().split('T')[0]

    // 시작일은 이미 오늘로 설정되어 있으므로 종료일만 입력
    const validUntilInput = page.locator('input[type="date"]').nth(1)
    await validUntilInput.fill(endDate)

    // 7. 수강인원 설정 (기본값 1 사용)

    // 8. 판매금액 설정
    await page.locator('input[placeholder="0"]').fill('200000')

    // 9-13. 나머지 옵션들은 기본값 사용

    // 14. 수강생 할당하지 않음 (미할당 수강권으로 생성)

    // 스크린샷 (디버깅용) - 맨 위로 스크롤해서 전체 폼 확인
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.screenshot({ path: 'test-results/ticket-form-top.png' })

    // 맨 아래로 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.screenshot({ path: 'test-results/ticket-form-bottom.png' })

    // alert 리스너 등록
    let dialogMessage = ''
    page.once('dialog', async (dialog) => {
      dialogMessage = dialog.message()
      console.log('Alert 메시지:', dialogMessage)
      await dialog.accept()
    })

    // 수강권 생성 버튼 클릭
    await page.getByRole('button', { name: '수강권 생성' }).click()

    // alert 다이얼로그 처리 대기
    await page.waitForTimeout(1000)

    // alert 메시지 및 API 응답 확인
    console.log('수신된 alert 메시지:', dialogMessage)
    console.log('API 응답:', apiResponse)

    if (!dialogMessage) {
      throw new Error('alert 다이얼로그가 나타나지 않았습니다')
    }

    if (!dialogMessage.includes('수강권이 생성되었습니다')) {
      throw new Error(`예상하지 못한 alert 메시지: ${dialogMessage}`)
    }

    if (!apiResponse || apiResponse.error) {
      throw new Error(`API 실패: ${apiResponse?.error || 'API 응답 없음'}`)
    }

    // 수강권 목록 페이지로 리다이렉트 확인
    await page.waitForURL('/admin/tickets', { timeout: 15000 })

    // "로딩 중..." 텍스트가 사라질 때까지 대기 (데이터 로드 완료)
    await page.waitForSelector('text=로딩 중...', { state: 'hidden', timeout: 10000 })

    // 디버깅: 스크린샷 (첫 번째)
    await page.screenshot({ path: 'test-results/ticket-list-after-redirect.png' })

    // 페이지 수동 새로고침 (router.refresh()가 제대로 동작하지 않을 수 있음)
    await page.reload()

    // 새로고침 후 다시 로딩 대기
    await page.waitForSelector('text=로딩 중...', { state: 'hidden', timeout: 10000 })

    // 디버깅: 스크린샷 (새로고침 후)
    await page.screenshot({ path: 'test-results/ticket-list-after-reload.png' })

    // 생성된 수강권이 목록에 표시되는지 확인
    await expect(page.getByText(ticketName)).toBeVisible({ timeout: 5000 })
  })

  test('학생에게 수강권 생성 및 할당', async ({ page }) => {
    // 수강권 생성 페이지로 이동
    await page.goto('/admin/tickets/new')

    await expect(page.getByRole('heading', { name: '수강권 등록' })).toBeVisible()

    // 1. 수업 종류 선택
    const classTypeSelect = page.locator('button').filter({ hasText: '수업 종류를 선택하세요' }).first()
    await classTypeSelect.click()
    await page.getByRole('option').first().click()

    // 2. 수강권 명칭
    const ticketName = `E2E 할당 수강권 ${Date.now()}`
    await page.locator('input[placeholder*="캐니크로스"]').fill(ticketName)

    // 3. 종료일 설정
    const today = new Date()
    const futureDate = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000) // 60일 후
    const endDate = futureDate.toISOString().split('T')[0]

    const validUntilInput = page.locator('input[type="date"]').nth(1)
    await validUntilInput.fill(endDate)

    // 4. 판매금액 설정
    await page.locator('input[placeholder="0"]').fill('150000')

    // 5. 수강생 할당 - 첫 번째 학생 선택
    // 페이지 맨 아래로 스크롤 (14번 섹션 보이게)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)

    // 14번 섹션 확인
    const studentSectionTitle = page.getByText('14. 수강생 할당 (선택사항)')
    await expect(studentSectionTitle).toBeVisible()

    // Radix UI Checkbox - 첫 번째 학생 체크박스
    // "14. 수강생 할당" 카드 내부의 체크박스를 찾음
    const checkboxes = page.getByRole('checkbox')
    const studentCheckboxCount = await checkboxes.count()

    console.log(`체크박스 개수: ${studentCheckboxCount}`)

    // 마지막 체크박스가 학생 체크박스 (앞의 체크박스들은 10번 섹션의 자동차감 체크박스들)
    // 10번 섹션에 2개 (주간, 월간) + 학생 체크박스들
    const firstStudentCheckbox = checkboxes.nth(2) // 3번째 체크박스가 첫 번째 학생

    // 체크박스 클릭
    await firstStudentCheckbox.click()

    // 선택된 학생 수 확인
    await expect(page.getByText('1명 선택됨')).toBeVisible()

    // 스크린샷
    await page.screenshot({ path: 'test-results/ticket-with-student.png' })

    // alert 리스너 등록
    page.once('dialog', async (dialog) => {
      console.log('Alert 메시지:', dialog.message())
      expect(dialog.message()).toContain('수강권이 생성되었습니다')
      await dialog.accept()
    })

    // 제출 버튼 클릭 (학생이 선택되었으므로 "수강권 생성 및 N명에게 발급" 텍스트)
    const submitButton = page.getByRole('button', { name: /수강권 생성/ })
    await submitButton.click()

    // 리다이렉트 확인
    await page.waitForURL('/admin/tickets', { timeout: 15000 })

    // "로딩 중..." 텍스트가 사라질 때까지 대기
    await page.waitForSelector('text=로딩 중...', { state: 'hidden', timeout: 10000 })

    // 페이지 수동 새로고침
    await page.reload()
    await page.waitForSelector('text=로딩 중...', { state: 'hidden', timeout: 10000 })

    await expect(page.getByText(ticketName)).toBeVisible({ timeout: 5000 })
  })

  test('기간제 수강권 생성', async ({ page }) => {
    // 수강권 생성 페이지로 이동
    await page.goto('/admin/tickets/new')

    // 1. 수업 종류 선택
    const classTypeSelect = page.locator('button').filter({ hasText: '수업 종류를 선택하세요' }).first()
    await classTypeSelect.click()
    await page.getByRole('option').first().click()

    // 2. 수강권 종류 - 기간제 선택
    const ticketTypeSelect = page.locator('button').filter({ hasText: '회수제 (횟수 기반)' }).first()
    await ticketTypeSelect.click()
    await page.getByRole('option', { name: '기간제 (기간 기반)' }).click()

    // 3. 수강권 명칭
    const ticketName = `E2E 기간제 수강권 ${Date.now()}`
    await page.locator('input[placeholder*="캐니크로스"]').fill(ticketName)

    // 4. 종료일 설정
    const today = new Date()
    const futureDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) // 30일 후
    const endDate = futureDate.toISOString().split('T')[0]

    const validUntilInput = page.locator('input[type="date"]').nth(1)
    await validUntilInput.fill(endDate)

    // 5. 판매금액
    await page.locator('input[placeholder="0"]').fill('100000')

    // 스크린샷
    await page.screenshot({ path: 'test-results/ticket-period-based.png' })

    // alert 리스너
    page.once('dialog', async (dialog) => {
      await dialog.accept()
    })

    // 제출
    await page.getByRole('button', { name: '수강권 생성' }).click()

    // 리다이렉트 확인
    await page.waitForURL('/admin/tickets', { timeout: 15000 })

    // "로딩 중..." 텍스트가 사라질 때까지 대기
    await page.waitForSelector('text=로딩 중...', { state: 'hidden', timeout: 10000 })

    // 페이지 수동 새로고침
    await page.reload()
    await page.waitForSelector('text=로딩 중...', { state: 'hidden', timeout: 10000 })

    await expect(page.getByText(ticketName)).toBeVisible({ timeout: 5000 })
  })

  test('미할당 수강권에 나중에 학생 할당하기', async ({ page }) => {
    // 1단계: 미할당 수강권 생성
    await page.goto('/admin/tickets/new')

    const classTypeSelect = page.locator('button').filter({ hasText: '수업 종류를 선택하세요' }).first()
    await classTypeSelect.click()
    await page.getByRole('option').first().click()

    const ticketName = `E2E 나중할당 ${Date.now()}`
    await page.locator('input[placeholder*="캐니크로스"]').fill(ticketName)

    const today = new Date()
    const futureDate = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000)
    const endDate = futureDate.toISOString().split('T')[0]

    const validUntilInput = page.locator('input[type="date"]').nth(1)
    await validUntilInput.fill(endDate)

    await page.locator('input[placeholder="0"]').fill('180000')

    // alert 리스너 등록
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('수강권이 생성되었습니다')
      await dialog.accept()
    })

    // 미할당 수강권 생성 (학생 선택하지 않음)
    await page.getByRole('button', { name: '수강권 생성' }).click()

    // 수강권 목록으로 리다이렉트
    await page.waitForURL('/admin/tickets', { timeout: 15000 })

    // "로딩 중..." 텍스트가 사라질 때까지 대기
    await page.waitForSelector('text=로딩 중...', { state: 'hidden', timeout: 10000 })

    // 페이지 수동 새로고침
    await page.reload()
    await page.waitForSelector('text=로딩 중...', { state: 'hidden', timeout: 10000 })

    // 2단계: 생성된 수강권 찾아서 클릭 (상세 페이지로 이동)
    const ticketCard = page.locator('.grid').locator('div').filter({ hasText: ticketName }).first()
    await expect(ticketCard).toBeVisible({ timeout: 5000 })

    // 카드 클릭하여 상세 페이지로 이동
    await ticketCard.click()

    // 상세 페이지로 이동 확인
    await page.waitForURL(/\/admin\/tickets\/[a-z0-9-]+/, { timeout: 10000 })

    // 수강권 명칭이 표시되는지 확인
    await expect(page.getByRole('heading', { name: ticketName })).toBeVisible()

    // 3단계: 학생 할당
    // "등록된 학생이 없습니다" 메시지 확인
    await expect(page.getByText('등록된 학생이 없습니다')).toBeVisible()

    // 학생 관리 섹션으로 스크롤
    const studentManagementTitle = page.getByText('학생 관리')
    await studentManagementTitle.scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)

    // Radix UI Checkbox - 첫 번째 학생 체크박스
    // 상세 페이지에는 학생 체크박스만 있으므로 first()로 충분
    const firstCheckbox = page.getByRole('checkbox').first()

    // 체크박스 클릭
    await firstCheckbox.click()

    // 선택된 학생 수 확인
    await expect(page.getByText('1명 선택됨')).toBeVisible()

    // 스크린샷
    await page.screenshot({ path: 'test-results/ticket-assign-later.png' })

    // 4단계: 저장
    // alert 리스너 등록
    page.once('dialog', async (dialog) => {
      console.log('Alert 메시지:', dialog.message())
      expect(dialog.message()).toContain('저장되었습니다')
      await dialog.accept()
    })

    // 저장 버튼 클릭
    await page.getByRole('button', { name: '저장' }).click()

    // 목록 페이지로 리다이렉트 확인
    await page.waitForURL('/admin/tickets', { timeout: 15000 })

    // "로딩 중..." 텍스트가 사라질 때까지 대기
    await page.waitForSelector('text=로딩 중...', { state: 'hidden', timeout: 10000 })

    // 페이지 수동 새로고침
    await page.reload()
    await page.waitForSelector('text=로딩 중...', { state: 'hidden', timeout: 10000 })

    // 생성된 수강권이 여전히 목록에 있는지 확인
    await expect(page.getByText(ticketName)).toBeVisible({ timeout: 5000 })
  })
})
