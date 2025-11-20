import { Page } from '@playwright/test'

export const TEST_ACCOUNTS = {
  student: {
    phone: process.env.TEST_STUDENT_PHONE || '',
    password: process.env.TEST_STUDENT_PASSWORD || '',
  },
  admin: {
    phone: process.env.TEST_ADMIN_PHONE || '',
    password: process.env.TEST_ADMIN_PASSWORD || '',
  },
}

export async function loginAsStudent(page: Page) {
  await page.goto('/')

  // 전화번호 입력 - id로 직접 선택하여 입력
  const phoneInput = page.locator('#phone')
  await phoneInput.click()
  await phoneInput.pressSequentially(TEST_ACCOUNTS.student.phone, { delay: 100 })

  // 비밀번호 입력
  await page.locator('#password').fill(TEST_ACCOUNTS.student.password)

  // 로그인 버튼 클릭
  await page.getByRole('button', { name: '로그인' }).click()

  // 리다이렉트 대기
  await page.waitForURL('/student', { timeout: 10000 })
}

export async function loginAsAdmin(page: Page) {
  // 루트 페이지에서 로그인 (role에 따라 자동 리다이렉트)
  await page.goto('/')

  // 전화번호 입력 - id로 직접 선택하여 입력
  const phoneInput = page.locator('#phone')
  await phoneInput.click()
  await phoneInput.pressSequentially(TEST_ACCOUNTS.admin.phone, { delay: 100 })

  // 비밀번호 입력
  await page.locator('#password').fill(TEST_ACCOUNTS.admin.password)

  // 로그인 버튼 클릭
  await page.getByRole('button', { name: '로그인' }).click()

  // role이 admin이므로 /admin으로 자동 리다이렉트됨
  await page.waitForURL('/admin', { timeout: 10000 })
}
