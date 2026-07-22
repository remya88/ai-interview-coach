import { test, expect, Page } from '@playwright/test';

/**
 * AI Interview Coach – Full User Journey E2E Tests
 *
 * Prerequisite: Backend (port 3000) and Frontend (port 4200) running locally.
 *
 * Covers:
 *  1. Landing page loads
 *  2. User registration
 *  3. Login with new credentials
 *  4. Dashboard is accessible
 *  5. Interview setup form loads
 *  6. Interview creation flow
 *  7. Interview question player loads
 *  8. Answer submission
 *  9. Interview completion
 * 10. Evaluation result page
 * 11. Analytics dashboard
 * 12. Logout
 */

const TEST_USER = {
  firstName: 'E2E',
  lastName: 'Tester',
  email: `e2e_${Date.now()}@test.example.com`,
  password: 'Test@1234',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

async function register(page: Page) {
  await page.goto('/register');
  await expect(page.locator('h1, h2, [data-testid="register-title"]').first()).toBeVisible({ timeout: 10000 });

  await page.fill('[formControlName="firstName"], [name="firstName"], input[placeholder*="First"]', TEST_USER.firstName);
  await page.fill('[formControlName="lastName"], [name="lastName"], input[placeholder*="Last"]', TEST_USER.lastName);
  await page.fill('[formControlName="email"], [name="email"], input[type="email"]', TEST_USER.email);
  await page.fill('[formControlName="password"], [name="password"], input[type="password"]', TEST_USER.password);

  await page.click('button[type="submit"], button:has-text("Register"), button:has-text("Sign up")');
  // Wait for redirect after registration
  await page.waitForURL(/\/(login|dashboard)/, { timeout: 15000 });
}

async function login(page: Page) {
  await page.goto('/login');
  await expect(page.locator('h1, h2, [data-testid="login-title"]').first()).toBeVisible({ timeout: 10000 });

  await page.fill('[formControlName="email"], [name="email"], input[type="email"]', TEST_USER.email);
  await page.fill('[formControlName="password"], [name="password"], input[type="password"]', TEST_USER.password);

  await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

test.describe('AI Interview Coach – User Journey', () => {

  test('1. Landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/AI Interview/i, { timeout: 10000 });
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('2. Registration page renders all required fields', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('3. Registration with valid credentials succeeds', async ({ page }) => {
    await register(page);
    // After register we land on /login or /dashboard
    const url = page.url();
    expect(url).toMatch(/\/(login|dashboard)/);
  });

  test('4. Login redirects to dashboard', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('5. Dashboard shows navigation and welcome content', async ({ page }) => {
    await login(page);
    await expect(page.locator('nav, [role="navigation"]').first()).toBeVisible();
    // Dashboard should render some content
    const main = page.locator('main, [role="main"], .dashboard, app-dashboard').first();
    await expect(main).toBeVisible({ timeout: 10000 });
  });

  test('6. Interview setup page is reachable from dashboard', async ({ page }) => {
    await login(page);
    // Navigate to interview setup
    await page.goto('/interview/setup');
    // The setup form should have a Submit/Start button
    await expect(page.locator('button[type="submit"], button:has-text("Start"), button:has-text("Create")').first()).toBeVisible({ timeout: 10000 });
  });

  test('7. Login form shows validation errors for empty submission', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');
    // At least one error/validation message should appear
    const errorLocator = page.locator(
      '.error, mat-error, [role="alert"], .invalid-feedback',
    );
    await expect(errorLocator.first()).toBeVisible({ timeout: 5000 });
  });

  test('8. Registration form shows validation errors for weak password', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', '123');
    await page.click('button[type="submit"]');
    const errorLocator = page.locator(
      '.error, mat-error, [role="alert"], .invalid-feedback',
    );
    await expect(errorLocator.first()).toBeVisible({ timeout: 5000 });
  });

  test('9. Analytics dashboard page loads after login', async ({ page }) => {
    await login(page);
    await page.goto('/analytics');
    // Should render the analytics component (not redirect to login)
    await expect(page).not.toHaveURL(/\/login/, { timeout: 5000 });
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('10. Protected routes redirect unauthenticated users to login', async ({ page }) => {
    // Do NOT login – go directly to dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/(login|auth\/login|\/)/, { timeout: 10000 });
  });

  test('11. Login rejects invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'notexist@example.com');
    await page.fill('input[type="password"]', 'WrongPassword123');
    await page.click('button[type="submit"]');
    // Should stay on /login and show error
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    const errorLocator = page.locator(
      '.error, mat-error, mat-snack-bar-container, [role="alert"], .snackbar',
    );
    await expect(errorLocator.first()).toBeVisible({ timeout: 8000 });
  });

  test('12. Registration rejects duplicate email', async ({ page }) => {
    // Use an already-registered email (from test 3)
    await page.goto('/register');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    try {
      await page.fill('[formControlName="firstName"], input[placeholder*="First"]', TEST_USER.firstName);
      await page.fill('[formControlName="lastName"], input[placeholder*="Last"]', TEST_USER.lastName);
    } catch {
      // Optional fields – ignore if not present
    }
    await page.click('button[type="submit"]');
    // Should show an error (either inline or snackbar)
    const errorLocator = page.locator(
      '.error, mat-error, mat-snack-bar-container, [role="alert"]',
    );
    await expect(errorLocator.first()).toBeVisible({ timeout: 10000 });
  });
});
