import { test, expect } from '@playwright/test';

test.describe('ProposalBox Basic E2E Tests', () => {

  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');

    // 检查页面标题
    await expect(page).toHaveTitle(/ProposalBox/i);

    // 检查Logo（使用更具体的选择器）
    await expect(page.locator('header a[href="/"]').first()).toBeVisible();

    // 检查主标题
    await expect(page.getByText(/Vote with Privacy/i)).toBeVisible();

    // 检查连接钱包按钮
    await expect(page.locator('button').filter({ hasText: /Connect/i }).first()).toBeVisible();
  });

  test('should navigate to Slates page', async ({ page }) => {
    await page.goto('/');

    // 点击导航链接（使用navigation中的链接）
    await page.locator('nav a[href="/slates"]').first().click();

    // 等待页面加载
    await page.waitForURL('**/slates');

    // 验证Slates页面加载
    await expect(page).toHaveURL(/slates/);
  });

  test('should navigate to About page', async ({ page }) => {
    await page.goto('/');

    // 点击About链接
    await page.locator('nav a[href="/about"]').click();

    // 等待页面加载
    await page.waitForURL('**/about');

    // 验证About页面加载
    await expect(page).toHaveURL(/about/);
  });

  test('should display wallet connect button', async ({ page }) => {
    await page.goto('/');

    const connectButton = page.locator('button').filter({ hasText: /Connect/i }).first();
    await expect(connectButton).toBeVisible();

    // 点击连接钱包按钮
    await connectButton.click();

    // 等待钱包选择Modal出现
    await page.waitForTimeout(1000);

    // 检查是否有钱包选项（RainbowKit Modal）
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5000 });
  });
});
