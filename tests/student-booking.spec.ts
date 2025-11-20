import { test, expect } from '@playwright/test'

test.describe('학생 예약 플로우', () => {
  test.beforeEach(async ({ page }) => {
    // 메인 페이지로 이동
    await page.goto('/')
  })

  test('학생 로그인 후 예약 가능한 일정 확인', async ({ page }) => {
    // 로그인 폼이 보이는지 확인
    await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible()

    // 전화번호 입력 (실제 테스트 계정 필요)
    await page.getByLabel('전화번호').fill('010-1234-5678')

    // 비밀번호 입력
    await page.getByLabel('비밀번호').fill('testpassword')

    // 로그인 버튼 클릭
    await page.getByRole('button', { name: '로그인' }).click()

    // 학생 페이지로 리다이렉트 확인
    await expect(page).toHaveURL('/student')

    // 예약하기 페이지로 이동
    await page.goto('/student/bookings')

    // 캘린더가 보이는지 확인
    await expect(page.getByRole('heading', { name: '수업 예약' })).toBeVisible()
  })

  test('예약 생성 플로우', async ({ page }) => {
    // TODO: 로그인 헬퍼 함수 만들어서 재사용
    // 여기서는 이미 로그인된 상태라고 가정
    await page.goto('/student/bookings')

    // 수강권 선택
    await page.selectOption('[data-testid="enrollment-select"]', { index: 0 })

    // 날짜 선택 (일정이 있는 날)
    // TODO: 실제 일정 있는 날짜로 클릭

    // 예약하기 버튼 클릭
    await page.getByRole('button', { name: '예약하기' }).click()

    // 확인 다이얼로그에서 확인 클릭
    await page.getByRole('button', { name: '확인' }).click()

    // 성공 토스트 메시지 확인
    await expect(page.getByText('예약이 완료되었습니다')).toBeVisible()
  })

  test('예약 취소 플로우', async ({ page }) => {
    // 이용내역 페이지로 이동
    await page.goto('/student/my-classes')

    // 예약완료 상태인 예약 찾기
    const cancelButton = page.getByRole('button', { name: '예약취소' }).first()
    await expect(cancelButton).toBeVisible()

    // 예약 취소 버튼 클릭
    await cancelButton.click()

    // 확인 다이얼로그에서 확인
    page.on('dialog', dialog => dialog.accept())

    // 취소 완료 토스트 확인
    await expect(page.getByText('예약 취소 완료')).toBeVisible({
      timeout: 5000,
    })
  })
})
