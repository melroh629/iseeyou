import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'

test.describe('관리자 일정 생성', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('기본 모드로 일정 생성 (매주 반복)', async ({ page }) => {
    // 일정 생성 페이지로 이동
    await page.goto('/admin/classes/new')

    // 페이지 로드 확인
    await expect(page.getByRole('heading', { name: '새 수업 만들기' })).toBeVisible()

    // 1. 수업 기본 정보
    const className = `E2E 테스트 수업 ${Date.now()}`
    await page.locator('#name').fill(className)
    await page.locator('#description').fill('Playwright E2E 테스트용 수업입니다')

    // 2. 수업 형태 - 그룹 수업 선택
    // selectOption 사용 (value="group")
    await page.locator('#type').selectOption('group')

    // 3. 최대 인원
    await page.locator('#maxStudents').fill('5')

    // 4. 수업 기간 설정
    const today = new Date()
    const startDate = today.toISOString().split('T')[0]
    const futureDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    const endDate = futureDate.toISOString().split('T')[0]

    await page.locator('#startDate').fill(startDate)
    await page.locator('#endDate').fill(endDate)

    // 5. 기본 모드 선택 (매주 반복)
    await page.getByRole('button', { name: '기본 모드 (매주 반복)' }).click()

    // 6. 요일 선택 - 월요일 클릭
    await page.getByRole('button', { name: '월' }).click()

    // 7. 시간 입력 - 첫 번째 time input이 시작 시간, 두 번째가 종료 시간
    const timeInputs = page.locator('input[type="time"]')
    await timeInputs.nth(0).fill('10:00')
    await timeInputs.nth(1).fill('11:00')

    // 스크린샷 (디버깅용)
    await page.screenshot({ path: 'test-results/schedule-before-submit.png' })

    // 8. alert 리스너 등록 (클릭 전에 등록해야 함!)
    page.once('dialog', async (dialog) => {
      console.log('Alert 메시지:', dialog.message())
      expect(dialog.message()).toContain('수업이 생성되었습니다')
      await dialog.accept()
    })

    // 9. 수업 생성 버튼 클릭
    await page.getByRole('button', { name: '수업 생성' }).click()

    // 10. 일정 목록 페이지로 리다이렉트 확인
    await page.waitForURL('/admin/classes', { timeout: 15000 })

    // 11. 생성된 수업이 목록에 표시되는지 확인
    await expect(page.getByText(className)).toBeVisible({ timeout: 5000 })
  })

  test('여러 요일에 일정 생성', async ({ page }) => {
    await page.goto('/admin/classes/new')

    const className = `E2E 다중 요일 ${Date.now()}`
    await page.locator('#name').fill(className)
    await page.locator('#description').fill('월/수/금 수업')

    // 그룹 수업 선택
    await page.locator('#type').selectOption('group')
    await page.locator('#maxStudents').fill('10')

    // 수업 기간
    const today = new Date()
    const startDate = today.toISOString().split('T')[0]
    const futureDate = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000)
    const endDate = futureDate.toISOString().split('T')[0]

    await page.locator('#startDate').fill(startDate)
    await page.locator('#endDate').fill(endDate)

    // 기본 모드 선택
    await page.getByRole('button', { name: '기본 모드 (매주 반복)' }).click()

    // 월, 수, 금 선택
    await page.getByRole('button', { name: '월' }).click()
    await page.getByRole('button', { name: '수' }).click()
    await page.getByRole('button', { name: '금' }).click()

    // 각 요일의 시간 입력
    // time input이 6개 생김 (월: 0,1 / 수: 2,3 / 금: 4,5)
    const timeInputs = page.locator('input[type="time"]')

    // 월요일 10:00-11:00
    await timeInputs.nth(0).fill('10:00')
    await timeInputs.nth(1).fill('11:00')

    // 수요일 14:00-15:00
    await timeInputs.nth(2).fill('14:00')
    await timeInputs.nth(3).fill('15:00')

    // 금요일 16:00-17:00
    await timeInputs.nth(4).fill('16:00')
    await timeInputs.nth(5).fill('17:00')

    // 스크린샷
    await page.screenshot({ path: 'test-results/schedule-multi-day.png' })

    // alert 리스너 등록
    page.once('dialog', async (dialog) => {
      console.log('Alert 메시지:', dialog.message())
      await dialog.accept()
    })

    // 제출
    await page.getByRole('button', { name: '수업 생성' }).click()

    // 리다이렉트 확인
    await page.waitForURL('/admin/classes', { timeout: 15000 })
    await expect(page.getByText(className)).toBeVisible({ timeout: 5000 })
  })
})
