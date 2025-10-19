import { test, expect, Page } from '@playwright/test';

interface TestReport {
  success: boolean;
  errors: string[];
  screenshots: string[];
  pageLoaded: boolean;
  proposalTitle: string | null;
  proposalDescription: string | null;
  optionsFound: number;
  consoleErrors: string[];
}

test.describe('ProposalBox 页面功能测试', () => {
  let testReport: TestReport;
  let consoleMessages: string[] = [];

  test.beforeEach(async ({ page }) => {
    testReport = {
      success: true,
      errors: [],
      screenshots: [],
      pageLoaded: false,
      proposalTitle: null,
      proposalDescription: null,
      optionsFound: 0,
      consoleErrors: []
    };
    consoleMessages = [];

    // 监听控制台消息
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      consoleMessages.push(`[${type}] ${text}`);
      if (type === 'error') {
        testReport.consoleErrors.push(text);
      }
    });

    // 监听页面错误
    page.on('pageerror', error => {
      const errorMsg = `Page Error: ${error.message}`;
      consoleMessages.push(errorMsg);
      testReport.consoleErrors.push(errorMsg);
    });
  });

  test('完整流程测试: 首页 -> Slates -> 提案详情', async ({ page }) => {
    try {
      console.log('\n========== 开始测试 ProposalBox 页面功能 ==========\n');

      // 1. 访问首页
      console.log('步骤 1: 访问首页 http://localhost:8081/');
      await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      testReport.pageLoaded = true;
      console.log('✓ 首页加载成功');

      // 截图首页
      const homeScreenshot = 'screenshots/01-homepage.png';
      await page.screenshot({ path: homeScreenshot, fullPage: true });
      testReport.screenshots.push(homeScreenshot);
      console.log(`✓ 首页截图: ${homeScreenshot}`);

      // 2. 点击进入 Slates 页面
      console.log('\n步骤 2: 查找并点击 Slates 链接');

      // 尝试多种方式查找 Slates 链接
      let slatesLink = page.getByRole('link', { name: /slates/i });
      if (await slatesLink.count() === 0) {
        slatesLink = page.locator('a:has-text("Slates")');
      }
      if (await slatesLink.count() === 0) {
        slatesLink = page.locator('a[href*="slates"]');
      }

      if (await slatesLink.count() > 0) {
        await slatesLink.first().click();
        await page.waitForTimeout(2000);
        console.log('✓ 成功点击 Slates 链接');
      } else {
        throw new Error('未找到 Slates 链接');
      }

      // 截图 Slates 页面
      const slatesScreenshot = 'screenshots/02-slates-page.png';
      await page.screenshot({ path: slatesScreenshot, fullPage: true });
      testReport.screenshots.push(slatesScreenshot);
      console.log(`✓ Slates 页面截图: ${slatesScreenshot}`);

      // 3. 查找提案列表（Slate 卡片）
      console.log('\n步骤 3: 查找 Slate 卡片列表');

      // 等待提案列表加载
      await page.waitForTimeout(2000);

      // 查找指向 /slate/ 的链接（这些是 Slate 卡片）
      const slateLinks = page.locator('a[href^="/slate/"]');
      const slateCount = await slateLinks.count();

      if (slateCount === 0) {
        throw new Error('未找到任何 Slate 卡片');
      }

      console.log(`✓ 找到 ${slateCount} 个 Slate 卡片`);

      // 打印前几个 Slate 的信息
      for (let i = 0; i < Math.min(5, slateCount); i++) {
        const text = await slateLinks.nth(i).textContent();
        const href = await slateLinks.nth(i).getAttribute('href');
        console.log(`  Slate ${i + 1}: ${href}`);
        console.log(`    内容预览: "${text?.substring(0, 50)}..."`);
      }

      // 找到第一个有提案的 Slate（不是"0 proposals"）
      let proposalItems = null;
      for (let i = 0; i < slateCount; i++) {
        const text = await slateLinks.nth(i).textContent();
        if (!text?.includes('0 proposals')) {
          proposalItems = slateLinks.nth(i);
          console.log(`✓ 选择了包含提案的 Slate: ${await proposalItems.getAttribute('href')}`);
          break;
        }
      }

      if (!proposalItems) {
        throw new Error('未找到包含提案的 Slate');
      }

      // 4. 点击 Slate 进入详情页
      console.log('\n步骤 4: 点击 Slate 进入详情页');
      await proposalItems.click();
      await page.waitForTimeout(3000);
      console.log('✓ 成功进入 Slate 详情页');

      // 5. 检查 Slate 详情页内容
      console.log('\n步骤 5: 检查 Slate 详情页内容');

      // 查找 Slate 标题
      const titleSelectors = ['h1', 'h2'];
      for (const selector of titleSelectors) {
        const title = page.locator(selector).first();
        if (await title.count() > 0) {
          testReport.proposalTitle = await title.textContent();
          console.log(`✓ Slate 标题: "${testReport.proposalTitle}"`);
          break;
        }
      }

      // 查找 Slate 描述
      const desc = page.locator('p').first();
      if (await desc.count() > 0) {
        testReport.proposalDescription = await desc.textContent();
        console.log(`✓ Slate 描述: "${testReport.proposalDescription?.substring(0, 100)}..."`);
      }

      // 查找提案列表（在 Slate 详情页中）
      const proposalCards = page.locator('article, div[class*="card"], div[class*="proposal"]');
      const proposalCount = await proposalCards.count();
      testReport.optionsFound = proposalCount;

      console.log(`✓ 在 Slate 中找到 ${proposalCount} 个提案`);

      // 打印提案信息
      for (let i = 0; i < Math.min(5, proposalCount); i++) {
        const cardText = await proposalCards.nth(i).textContent();
        console.log(`  提案 ${i + 1}: "${cardText?.substring(0, 80)}..."`);
      }

      // 6. 截图详情页
      console.log('\n步骤 6: 截图提案详情页');
      const detailScreenshot = 'screenshots/03-proposal-detail.png';
      await page.screenshot({ path: detailScreenshot, fullPage: true });
      testReport.screenshots.push(detailScreenshot);
      console.log(`✓ 详情页截图: ${detailScreenshot}`);

      // 7. 输出测试报告
      console.log('\n========== 测试报告 ==========');
      console.log(`页面加载状态: ${testReport.pageLoaded ? '✓ 成功' : '✗ 失败'}`);
      console.log(`提案标题: ${testReport.proposalTitle || '✗ 未找到'}`);
      console.log(`提案描述: ${testReport.proposalDescription ? '✓ 已显示' : '✗ 未找到'}`);
      console.log(`选项数量: ${testReport.optionsFound || '✗ 未找到选项'}`);
      console.log(`控制台错误数: ${testReport.consoleErrors.length}`);

      if (testReport.consoleErrors.length > 0) {
        console.log('\n控制台错误信息:');
        testReport.consoleErrors.forEach((err, i) => {
          console.log(`  ${i + 1}. ${err}`);
        });
      }

      console.log('\n所有截图:');
      testReport.screenshots.forEach(path => console.log(`  - ${path}`));

      console.log('\n所有控制台消息:');
      consoleMessages.forEach(msg => console.log(`  ${msg}`));

      console.log('\n========== 测试完成 ==========\n');

      // 验证关键内容是否存在
      expect(testReport.pageLoaded).toBeTruthy();

    } catch (error) {
      testReport.success = false;
      testReport.errors.push((error as Error).message);

      console.error('\n========== 测试失败 ==========');
      console.error('错误信息:', (error as Error).message);
      console.error('控制台错误:', testReport.consoleErrors);

      // 即使失败也截图
      const errorScreenshot = 'screenshots/error.png';
      await page.screenshot({ path: errorScreenshot, fullPage: true });
      console.error(`错误截图: ${errorScreenshot}`);

      throw error;
    }
  });
});
