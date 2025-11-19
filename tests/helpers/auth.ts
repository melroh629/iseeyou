import { Page } from '@playwright/test'

export const TEST_ACCOUNTS = {
  student: {
    phone: '010-1234-5678',
    password: 'testpassword',
  },
  admin: {
    phone: '010-9999-9999',
    password: 'adminpassword',
  },
}

export async function loginAsStudent(page: Page) {
  await page.goto('/')
  await page.getByLabel('전화번호').fill(TEST_ACCOUNTS.student.phone)
  await page.getByLabel('비밀번호').fill(TEST_ACCOUNTS.student.password)
  await page.getByRole('button', { name: '로그인' }).click()

  // 리다이렉트 대기
  await page.waitForURL('/student')
}

export async function loginAsAdmin(page: Page) {
  await page.goto('/admin/login')
  await page.getByLabel('전화번호').fill(TEST_ACCOUNTS.admin.phone)
  await page.getByLabel('비밀번호').fill(TEST_ACCOUNTS.admin.password)
  await page.getByRole('button', { name: '로그인' }).click()

  // 리다이렉트 대기
  await page.waitForURL('/admin')
}
