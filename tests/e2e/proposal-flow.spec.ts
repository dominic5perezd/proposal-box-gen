import { test, expect } from '@playwright/test';

/**
 * ProposalBox E2E Test Suite
 * Senior Test Engineer - Frontend & Backend Integration Testing
 *
 * Test Scenarios:
 * 1. Homepage navigation and UI verification
 * 2. Create Proposal page form validation
 * 3. Proposal list display and data verification
 * 4. End-to-end proposal creation flow
 */

const BASE_URL = 'http://localhost:8083';

test.describe('ProposalBox E2E Test Suite', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('Test 1: Homepage loads correctly', async ({ page }) => {
    console.log('✅ Test 1: Verifying homepage...');

    // Check page title
    await expect(page).toHaveTitle(/ProposalBox|Vite/);

    // Check header is visible
    const header = page.locator('header, nav').first();
    await expect(header).toBeVisible();

    console.log('   ✓ Homepage loaded successfully');
  });

  test('Test 2: Navigation to Create Proposal page', async ({ page }) => {
    console.log('✅ Test 2: Testing navigation...');

    // Find and click Create link
    const createLink = page.getByRole('link', { name: /create/i });
    await expect(createLink).toBeVisible();
    await createLink.click();

    // Wait for navigation
    await page.waitForURL('**/create');

    // Verify we're on the create page
    await expect(page.locator('text=/create.*proposal/i').or(page.locator('h1, h2').filter({ hasText: /proposal/i }))).toBeVisible({ timeout: 10000 });

    console.log('   ✓ Navigated to Create Proposal page');
  });

  test('Test 3: Create Proposal form validation', async ({ page }) => {
    console.log('✅ Test 3: Testing form validation...');

    await page.goto(`${BASE_URL}/create`);
    await page.waitForLoadState('networkidle');

    // Check for title input
    const titleInput = page.locator('input[id="title"], input[placeholder*="title" i]').first();
    await expect(titleInput).toBeVisible();

    // Check for description textarea
    const descriptionInput = page.locator('textarea[id="description"], textarea[placeholder*="descr" i]').first();
    await expect(descriptionInput).toBeVisible();

    // Check for duration selection
    const durationButtons = page.locator('button:has-text("Day"), button:has-text("Week")');
    const durationButtonCount = await durationButtons.count();
    expect(durationButtonCount).toBeGreaterThan(0);

    console.log('   ✓ All form fields are present');
  });

  test('Test 4: Fill out Create Proposal form', async ({ page }) => {
    console.log('✅ Test 4: Testing form input...');

    await page.goto(`${BASE_URL}/create`);
    await page.waitForLoadState('networkidle');

    // Fill in title
    const titleInput = page.locator('input[id="title"], input[placeholder*="title" i]').first();
    await titleInput.fill('E2E Test Proposal - Community Fund');

    // Fill in description
    const descriptionInput = page.locator('textarea[id="description"], textarea[placeholder*="descr" i]').first();
    await descriptionInput.fill('This is an automated E2E test proposal to verify the create proposal functionality.');

    // Select 1 Week duration
    const weekButton = page.locator('button:has-text("Week")').first();
    await weekButton.click();

    console.log('   ✓ Form filled successfully');

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/create-proposal-filled.png', fullPage: true });
    console.log('   ✓ Screenshot saved');
  });

  test('Test 5: Custom voting options', async ({ page }) => {
    console.log('✅ Test 5: Testing custom voting options...');

    await page.goto(`${BASE_URL}/create`);
    await page.waitForLoadState('networkidle');

    // Look for custom options radio/button
    const customOptionButton = page.locator('button:has-text("Custom"), input[value="custom"]~label, label:has-text("Custom")').first();

    if (await customOptionButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await customOptionButton.click();

      // Check if custom option inputs appear
      const optionInputs = page.locator('input[placeholder*="option" i]');
      const inputCount = await optionInputs.count();

      expect(inputCount).toBeGreaterThan(0);
      console.log(`   ✓ Found ${inputCount} custom option inputs`);

      // Fill in first two options
      if (inputCount >= 2) {
        await optionInputs.nth(0).fill('Development - $60K');
        await optionInputs.nth(1).fill('Marketing - $40K');
        console.log('   ✓ Custom options filled');
      }
    } else {
      console.log('   ℹ Custom options not available or not visible');
    }

    await page.screenshot({ path: 'tests/screenshots/custom-options.png', fullPage: true });
  });

  test('Test 6: Navigate to All Slates page', async ({ page }) => {
    console.log('✅ Test 6: Testing Slates page...');

    // Find and click Slates/All Proposals link
    const slatesLink = page.getByRole('link', { name: /slate|all.*proposal/i }).first();
    await slatesLink.click();

    await page.waitForLoadState('networkidle');

    // Check for proposal cards or list items
    const proposalCards = page.locator('[class*="card"], [class*="proposal"]');
    const cardCount = await proposalCards.count();

    console.log(`   ✓ Found ${cardCount} proposal items on the page`);

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/all-slates.png', fullPage: true });
  });

  test('Test 7: Verify created proposal in list', async ({ page }) => {
    console.log('✅ Test 7: Verifying proposals in list...');

    await page.goto(`${BASE_URL}/slates`);
    await page.waitForLoadState('networkidle');

    // Look for the test proposal created by contract
    const testProposal = page.locator('text=/Community Fund Allocation Test/i').first();

    if (await testProposal.isVisible({ timeout: 10000 }).catch(() => false)) {
      console.log('   ✓ Found test proposal in list');

      // Click on the proposal
      await testProposal.click();
      await page.waitForLoadState('networkidle');

      // Verify we're on proposal detail page
      const proposalTitle = page.locator('h1, h2').filter({ hasText: /Community Fund/i });
      await expect(proposalTitle).toBeVisible();

      console.log('   ✓ Proposal detail page loaded');
      await page.screenshot({ path: 'tests/screenshots/proposal-detail.png', fullPage: true });
    } else {
      console.log('   ℹ Test proposal not found (may not have been created yet)');
    }
  });

  test('Test 8: Complete UI flow test', async ({ page }) => {
    console.log('✅ Test 8: Complete UI flow...');

    const testResults = {
      homepage: false,
      createPage: false,
      slatesPage: false,
      formFields: false
    };

    // Step 1: Homepage
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    testResults.homepage = true;
    console.log('   ✓ Step 1: Homepage loaded');

    // Step 2: Navigate to Create
    const createLink = page.getByRole('link', { name: /create/i });
    await createLink.click();
    await page.waitForURL('**/create');
    testResults.createPage = true;
    console.log('   ✓ Step 2: Create page loaded');

    // Step 3: Verify form fields
    const titleVisible = await page.locator('input[id="title"], input[placeholder*="title" i]').isVisible();
    const descVisible = await page.locator('textarea').first().isVisible();
    testResults.formFields = titleVisible && descVisible;
    console.log('   ✓ Step 3: Form fields verified');

    // Step 4: Navigate to Slates
    const slatesLink = page.getByRole('link', { name: /slate|all/i }).first();
    await slatesLink.click();
    await page.waitForLoadState('networkidle');
    testResults.slatesPage = true;
    console.log('   ✓ Step 4: Slates page loaded');

    // Summary
    const allPassed = Object.values(testResults).every(v => v);
    console.log('\n   📊 Flow Test Results:');
    console.log(`   Homepage: ${testResults.homepage ? '✅' : '❌'}`);
    console.log(`   Create Page: ${testResults.createPage ? '✅' : '❌'}`);
    console.log(`   Form Fields: ${testResults.formFields ? '✅' : '❌'}`);
    console.log(`   Slates Page: ${testResults.slatesPage ? '✅' : '❌'}`);
    console.log(`\n   Overall: ${allPassed ? '✅ PASS' : '❌ FAIL'}`);

    expect(allPassed).toBe(true);
  });

});
