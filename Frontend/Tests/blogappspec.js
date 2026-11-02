import { test, expect } from '@playwright/test'

const backendUrl = 'http://localhost:3003'

test.describe('Blog app', () => {
  let credentials

  test.beforeEach(async ({ page, request }) => {
    credentials = {
      username: `playwright${Date.now()}${Math.floor(Math.random() * 10000)}`,
      name: 'Playwright User',
      password: 'secretpassword',
    }
    await request.post(`${backendUrl}/api/users`, { data: credentials })
    await page.goto('/')
  })

  const login = async (page) => {
    await page.getByRole('link', { name: 'login' }).click()
    await page.getByPlaceholder('username').fill(credentials.username)
    await page.getByPlaceholder('password').fill(credentials.password)
    await page.getByRole('button', { name: 'login' }).click()
    await expect(page.getByText('Playwright User logged in')).toBeVisible()
  }

  const createBlog = async (page, title, author, url = 'https://example.com') => {
    await page.getByRole('link', { name: 'create' }).click()
    await page.getByLabel('title').fill(title)
    await page.getByLabel('author').fill(author)
    await page.getByLabel('url').fill(url)
    await page.getByRole('button', { name: 'create' }).click()
    await expect(page).toHaveURL('/')
  }

  test('login succeeds with correct credentials', async ({ page }) => {
    await login(page)
    await expect(page).toHaveURL('/')
  })

  test('login shows feedback for incorrect credentials', async ({ page }) => {
    await page.getByRole('link', { name: 'login' }).click()
    await page.getByPlaceholder('username').fill(credentials.username)
    await page.getByPlaceholder('password').fill('wrongpassword')
    await page.getByRole('button', { name: 'login' }).click()
    await expect(page.getByText('wrong credentials')).toBeVisible()
    await expect(page.getByText('Playwright User logged in')).not.toBeVisible()
  })

  test('a logged-in user can create and view a blog', async ({ page }) => {
    await login(page)
    await createBlog(page, 'Routing via Playwright', 'Remix Competitor')
    await page.getByRole('link', { name: 'Routing via Playwright Remix Competitor' }).click()
    await expect(page.getByRole('heading', { name: 'Routing via Playwright Remix Competitor' })).toBeVisible()
  })

  test('a logged-in user can like a blog', async ({ page }) => {
    await login(page)
    await createBlog(page, 'Like testing', 'Vite Enthusiast')
    await page.getByRole('link', { name: 'Like testing Vite Enthusiast' }).click()
    await expect(page.getByText('likes 0')).toBeVisible()
    await page.getByRole('button', { name: 'like' }).click()
    await expect(page.getByText('likes 1')).toBeVisible()
  })

  test('a blog owner can delete a blog', async ({ page }) => {
    await login(page)
    await createBlog(page, 'Transient Blog Entry', 'Discardable Author')
    await page.getByRole('link', { name: 'Transient Blog Entry Discardable Author' }).click()
    page.once('dialog', dialog => dialog.accept())
    await page.getByRole('button', { name: 'remove' }).click()
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('link', { name: 'Transient Blog Entry Discardable Author' })).toHaveCount(0)
  })
})
