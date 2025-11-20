import { test, expect } from '@playwright/test'

test.describe('관리자 로그인 테스트', () => {
  test('관리자 로그인 성공 (루트 페이지에서)', async ({ page }) => {
    // 루트 페이지로 이동
    await page.goto('/')

    // 페이지 로드 확인 - "ISeeYou" 제목이 있는지 (h1 태그)
    await expect(page.getByRole('heading', { name: 'ISeeYou' })).toBeVisible()

    // 전화번호 입력 - id="phone" 사용
    // formatPhoneNumber가 자동으로 하이픈을 추가하므로 숫자만 입력
    const phoneInput = page.locator('#phone')
    await phoneInput.click()
    await phoneInput.pressSequentially('01099999999', { delay: 100 })

    // 비밀번호 입력 - id="password" 사용
    await page.locator('#password').fill('adminpassword123')

    // 스크린샷 (디버깅용)
    await page.screenshot({ path: 'test-results/admin-before-login.png' })

    // 로그인 버튼 클릭
    await page.getByRole('button', { name: '로그인' }).click()

    // 로그인 성공 후 role에 따라 /admin으로 자동 리다이렉트
    await page.waitForURL('/admin', { timeout: 15000 })

    // 스크린샷 (디버깅용)
    await page.screenshot({ path: 'test-results/admin-after-login.png' })

    // URL 확인
    await expect(page).toHaveURL('/admin')

    // 대시보드 제목 확인 - "관리자 대시보드" (h1 태그)
    await expect(page.getByRole('heading', { name: '관리자 대시보드' })).toBeVisible()
  })
})
