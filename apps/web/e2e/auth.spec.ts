import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.locator('h2')).toContainText('Iniciar Sesión')
  })

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/auth/login')

    await page.fill('input[name="email"]', 'invalid@test.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Credenciales inválidas')).toBeVisible()
  })

  test('should redirect to dashboard after successful login', async ({ page }) => {
    await page.goto('/auth/login')

    await page.fill('input[name="email"]', 'admin@condominios.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/\/dashboard/)
  })
})

test.describe('Registration', () => {
  test('should display registration page', async ({ page }) => {
    await page.goto('/auth/register')
    await expect(page.locator('h2')).toContainText('Crear Cuenta')
  })

  test('should show error when passwords do not match', async ({ page }) => {
    await page.goto('/auth/register')

    await page.fill('input[name="name"]', 'Test')
    await page.fill('input[name="lastName"]', 'User')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.fill('input[name="confirmPassword"]', 'different123')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Las contraseñas no coinciden')).toBeVisible()
  })
})

test.describe('Dashboard', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/auth\/login/)
  })
})

test.describe('Landing Page', () => {
  test('should display hero section', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Gestiona tu condominio')
  })

  test('should navigate to login', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Iniciar Sesión')
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('should navigate to register', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Registrarse')
    await expect(page).toHaveURL(/\/auth\/register/)
  })
})
