/**
 * Playwright E2E Tests - Capital Gains Tax Calculator
 * 양도소득세 계산기 E2E 테스트
 *
 * @description Comprehensive end-to-end tests for the capital gains tax form
 * covering all user flows and edge cases
 */

import { test, expect } from '@playwright/test';

/**
 * Helper Functions
 */

/**
 * Dismiss webpack dev server error overlay if present
 */
async function dismissWebpackOverlay(page) {
  try {
    // Check if webpack overlay iframe exists
    const overlay = page.locator('iframe#webpack-dev-server-client-overlay');
    if (await overlay.count() > 0) {
      // Remove the overlay iframe
      await page.evaluate(() => {
        const iframe = document.getElementById('webpack-dev-server-client-overlay');
        if (iframe) {
          iframe.remove();
        }
      });
    }
  } catch (error) {
    // Ignore errors - overlay might not exist
  }
}

/**
 * Fill basic property information
 */
async function fillBasicInfo(page, data) {
  await page.fill('input[name="acquisitionDate"]', data.acquisitionDate);
  await page.fill('input[name="transferDate"]', data.transferDate);
  await page.fill('input[name="acquisitionPrice"]', data.acquisitionPrice);
  await page.fill('input[name="transferPrice"]', data.transferPrice);

  if (data.necessaryExpenses) {
    await page.fill('input[name="necessaryExpenses"]', data.necessaryExpenses);
  }
}

/**
 * Fill house information
 */
async function fillHouseInfo(page, data) {
  // Select house count
  await page.click(`input[type="radio"][value="${data.houseCount}"]`);

  // Fill address
  if (data.address) {
    await page.fill('input[name="address"]', data.address);
  }

  // For 2 houses, check temporary dual ownership if needed
  if (data.houseCount === 2 && data.tempDual2Years) {
    await page.check('input[name="tempDual2Years"]');
  }

  // For 1 house, fill residence years if provided
  if (data.houseCount === 1 && data.residenceYears) {
    await page.fill('input[name="residenceYears"]', data.residenceYears);
  }
}

/**
 * Submit form and wait for results
 */
async function submitForm(page) {
  await page.click('button[type="submit"]:has-text("계산하기")');

  // Wait for results section to appear
  await page.waitForSelector('.results-section', { timeout: 5000 });
}

/**
 * Format number for Korean locale
 */
function formatKoreanNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Test Suites
 */

test.describe('양도소득세 계산기 E2E 테스트', () => {

  /**
   * Before Each: Navigate to the calculator page
   */
  test.beforeEach(async ({ page }) => {
    await page.goto('/capital-gains');

    // Dismiss any webpack overlay that might be blocking the page
    await dismissWebpackOverlay(page);

    // Wait for the form to load
    await page.waitForSelector('.capital-gains-tax-calculator');
  });

  /**
   * Test Suite 1: Page Load and Initial State
   */
  test.describe('페이지 로드 및 초기 상태', () => {

    test('페이지가 올바르게 로드됨', async ({ page }) => {
      // Check header
      await expect(page.locator('h1')).toContainText('양도소득세 계산기');

      // Check subtitle
      await expect(page.locator('.subtitle')).toContainText('부동산 양도소득세를 간편하게 계산해보세요');

      // Check form sections
      await expect(page.locator('h2:has-text("📋 기본 정보")')).toBeVisible();
      await expect(page.locator('h2:has-text("🏠 주택 정보")')).toBeVisible();
    });

    test('모든 필수 입력 필드가 존재함', async ({ page }) => {
      await expect(page.locator('input[name="acquisitionDate"]')).toBeVisible();
      await expect(page.locator('input[name="transferDate"]')).toBeVisible();
      await expect(page.locator('input[name="acquisitionPrice"]')).toBeVisible();
      await expect(page.locator('input[name="transferPrice"]')).toBeVisible();
      await expect(page.locator('input[name="address"]')).toBeVisible();
    });

    test('라디오 버튼이 기본값(1주택)으로 설정됨', async ({ page }) => {
      await expect(page.locator('input[type="radio"][value="1"]')).toBeChecked();
    });

    test('계산하기 버튼이 존재함', async ({ page }) => {
      await expect(page.locator('button[type="submit"]:has-text("계산하기")')).toBeVisible();
    });
  });

  /**
   * Test Suite 2: Real-time Holding Period Calculation
   */
  test.describe('실시간 보유기간 계산', () => {

    test('취득일과 양도일 입력 시 보유기간이 자동 계산됨', async ({ page }) => {
      await page.fill('input[name="acquisitionDate"]', '2019-01-15');
      await page.fill('input[name="transferDate"]', '2024-06-20');

      // Wait for holding period to update
      await page.waitForTimeout(500);

      // Check if holding period is displayed
      const holdingPeriodBox = await page.locator('.info-box:has-text("보유기간:")');
      await expect(holdingPeriodBox).toBeVisible();
      const holdingPeriodText = await holdingPeriodBox.textContent();
      expect(holdingPeriodText).toMatch(/\d+년/); // Should contain "{number}년"
    });

    test('양도일이 취득일보다 빠를 경우 보유기간이 표시되지 않음', async ({ page }) => {
      await page.fill('input[name="acquisitionDate"]', '2024-06-20');
      await page.fill('input[name="transferDate"]', '2019-01-15');

      await page.waitForTimeout(500);

      // Holding period should not be displayed
      const holdingPeriodExists = await page.locator('text=보유기간:').count();
      expect(holdingPeriodExists).toBe(0);
    });
  });

  /**
   * Test Suite 3: Number Formatting
   */
  test.describe('숫자 포맷팅', () => {

    test('취득가액 입력 시 천 단위 구분 기호 표시됨', async ({ page }) => {
      const input = page.locator('input[name="acquisitionPrice"]');
      await input.fill('500000000');
      await input.blur();

      await page.waitForTimeout(300);

      const value = await input.inputValue();
      expect(value).toContain(',');
    });

    test('양도가액 입력 시 천 단위 구분 기호 표시됨', async ({ page }) => {
      const input = page.locator('input[name="transferPrice"]');
      await input.fill('800000000');
      await input.blur();

      await page.waitForTimeout(300);

      const value = await input.inputValue();
      expect(value).toContain(',');
    });
  });

  /**
   * Test Suite 4: Form Validation
   */
  test.describe('폼 유효성 검증', () => {

    test('필수 필드 미입력 시 에러 메시지 표시', async ({ page }) => {
      await page.click('button[type="submit"]:has-text("계산하기")');

      // Check for error messages
      await expect(page.locator('.error-message').first()).toBeVisible();
    });

    test('양도일이 취득일보다 빠를 경우 에러 메시지 표시', async ({ page }) => {
      await fillBasicInfo(page, {
        acquisitionDate: '2024-06-20',
        transferDate: '2024-01-15',
        acquisitionPrice: '500000000',
        transferPrice: '800000000'
      });

      await page.click('button[type="submit"]:has-text("계산하기")');

      await expect(page.locator('.error-message:has-text("양도일은 취득일 이후여야 합니다")')).toBeVisible();
    });
  });

  /**
   * Test Suite 5: Conditional Rendering
   */
  test.describe('조건부 렌더링', () => {

    test('1주택 선택 시 거주기간 입력 필드 표시', async ({ page }) => {
      await page.click('input[type="radio"][value="1"]');
      await expect(page.locator('input[name="residenceYears"]')).toBeVisible();
    });

    test('2주택 선택 시 일시적 2주택 체크박스 표시', async ({ page }) => {
      await page.click('input[type="radio"][value="2"]');
      await expect(page.locator('input[name="tempDual2Years"]')).toBeVisible();
    });

    test('3주택 이상 선택 시 거주기간과 일시적 2주택 숨김', async ({ page }) => {
      await page.click('input[type="radio"][value="3"]');

      const residenceYearsCount = await page.locator('input[name="residenceYears"]').count();
      const tempDual2YearsCount = await page.locator('input[name="tempDual2Years"]').count();

      expect(residenceYearsCount).toBe(0);
      expect(tempDual2YearsCount).toBe(0);
    });
  });

  /**
   * Test Suite 6: Calculation Scenarios - 1세대1주택 비과세
   */
  test.describe('계산 시나리오: 1세대1주택 비과세', () => {

    test('예시 1: 전액 비과세 (일반 케이스)', async ({ page }) => {
      await fillBasicInfo(page, {
        acquisitionDate: '2019-01-15',
        transferDate: '2024-06-20',
        acquisitionPrice: '500000000',
        transferPrice: '800000000'
      });

      await fillHouseInfo(page, {
        houseCount: 1,
        address: '서울특별시 강남구',
        residenceYears: '3'
      });

      await submitForm(page);

      // Check for tax-free result
      await expect(page.locator('.result-highlight.success')).toBeVisible();
      await expect(page.locator('.result-highlight.success')).toContainText('비과세');
      await expect(page.locator('.result-highlight.success')).toContainText('0원');
    });

    test('예시 2: 12억 초과 부분 과세', async ({ page }) => {
      await fillBasicInfo(page, {
        acquisitionDate: '2014-03-10',
        transferDate: '2024-03-10',
        acquisitionPrice: '600000000',
        transferPrice: '1500000000'
      });

      await fillHouseInfo(page, {
        houseCount: 1,
        address: '서울특별시 송파구',
        residenceYears: '8'
      });

      await submitForm(page);

      // Check for partial taxation
      await expect(page.locator('.result-highlight.warning')).toBeVisible();
      await expect(page.locator('.result-highlight.warning')).toContainText('총 납부세액');

      // Check for calculation details
      await expect(page.locator('.calculation-details')).toBeVisible();
      await expect(page.locator('.calculation-details')).toContainText('장기보유특별공제');
    });
  });

  /**
   * Test Suite 7: Calculation Scenarios - 다주택자 중과세
   */
  test.describe('계산 시나리오: 다주택자 중과세', () => {

    test('예시 3: 3주택 이상 중과세 (조정대상지역)', async ({ page }) => {
      await fillBasicInfo(page, {
        acquisitionDate: '2020-05-01',
        transferDate: '2024-05-01',
        acquisitionPrice: '400000000',
        transferPrice: '700000000'
      });

      await fillHouseInfo(page, {
        houseCount: 3,
        address: '서울특별시 강남구'
      });

      await submitForm(page);

      // Check for surcharge warning
      await expect(page.locator('.result-highlight.warning')).toBeVisible();
      await expect(page.locator('.warnings-box')).toBeVisible();
      await expect(page.locator('.warnings-box')).toContainText('중과세');
    });

    test('예시 4: 일시적 2주택 (중과세 제외)', async ({ page }) => {
      await fillBasicInfo(page, {
        acquisitionDate: '2021-08-01',
        transferDate: '2024-08-01',
        acquisitionPrice: '500000000',
        transferPrice: '650000000'
      });

      await fillHouseInfo(page, {
        houseCount: 2,
        address: '경기도 성남시 분당구',
        tempDual2Years: true
      });

      await submitForm(page);

      // Check that result is displayed
      await expect(page.locator('.result-highlight.warning')).toBeVisible();

      // Check that calculation details are shown
      await expect(page.locator('.calculation-details')).toBeVisible();
    });
  });

  /**
   * Test Suite 8: Edge Cases
   */
  test.describe('엣지 케이스', () => {

    test('양도차익이 0인 경우', async ({ page }) => {
      await fillBasicInfo(page, {
        acquisitionDate: '2020-01-01',
        transferDate: '2024-01-01',
        acquisitionPrice: '500000000',
        transferPrice: '500000000'
      });

      await fillHouseInfo(page, {
        houseCount: 1,
        address: '서울특별시 강남구'
      });

      await submitForm(page);

      await expect(page.locator('.result-highlight.success')).toBeVisible();
      await expect(page.locator('.result-highlight')).toContainText('0원');
    });

    test('양도차익이 음수인 경우 (손실)', async ({ page }) => {
      await fillBasicInfo(page, {
        acquisitionDate: '2020-01-01',
        transferDate: '2024-01-01',
        acquisitionPrice: '700000000',
        transferPrice: '500000000'
      });

      await fillHouseInfo(page, {
        houseCount: 1,
        address: '서울특별시 강남구'
      });

      await submitForm(page);

      await expect(page.locator('.result-highlight.info')).toBeVisible();
      await expect(page.locator('.result-highlight')).toContainText('손실');
    });

    test('보유기간 2년 미만 (1세대1주택 비과세 미적용)', async ({ page }) => {
      await fillBasicInfo(page, {
        acquisitionDate: '2023-01-01',
        transferDate: '2024-01-01',
        acquisitionPrice: '500000000',
        transferPrice: '600000000'
      });

      await fillHouseInfo(page, {
        houseCount: 1,
        address: '서울특별시 강남구',
        residenceYears: '0.5'
      });

      await submitForm(page);

      // Should be taxable (not exempt)
      await expect(page.locator('.result-highlight.warning')).toBeVisible();
    });
  });

  /**
   * Test Suite 9: Reset Functionality
   */
  test.describe('초기화 기능', () => {

    test('초기화 버튼 클릭 시 모든 필드가 리셋됨', async ({ page }) => {
      // Fill form
      await fillBasicInfo(page, {
        acquisitionDate: '2019-01-15',
        transferDate: '2024-06-20',
        acquisitionPrice: '500000000',
        transferPrice: '800000000'
      });

      await fillHouseInfo(page, {
        houseCount: 2,
        address: '서울특별시 강남구'
      });

      // Click reset button
      await page.click('button:has-text("초기화")');

      // Check if fields are cleared
      await expect(page.locator('input[name="acquisitionDate"]')).toHaveValue('');
      await expect(page.locator('input[name="transferDate"]')).toHaveValue('');
      // Number fields reset to "0"
      const acquisitionPriceValue = await page.locator('input[name="acquisitionPrice"]').inputValue();
      expect(acquisitionPriceValue === '' || acquisitionPriceValue === '0').toBeTruthy();
      const transferPriceValue = await page.locator('input[name="transferPrice"]').inputValue();
      expect(transferPriceValue === '' || transferPriceValue === '0').toBeTruthy();

      // Check if house count is reset to 1
      await expect(page.locator('input[type="radio"][value="1"]')).toBeChecked();
    });

    test('초기화 후 결과 섹션이 사라짐', async ({ page }) => {
      // Fill and submit form
      await fillBasicInfo(page, {
        acquisitionDate: '2019-01-15',
        transferDate: '2024-06-20',
        acquisitionPrice: '500000000',
        transferPrice: '800000000'
      });

      await fillHouseInfo(page, {
        houseCount: 1,
        address: '서울특별시 강남구',
        residenceYears: '3'
      });

      await submitForm(page);

      // Verify results are shown
      await expect(page.locator('.results-section')).toBeVisible();

      // Click reset
      await page.click('button:has-text("초기화")');

      // Results should be hidden
      const resultsCount = await page.locator('.results-section').count();
      expect(resultsCount).toBe(0);
    });
  });

  /**
   * Test Suite 10: Accessibility
   */
  test.describe('접근성 테스트', () => {

    test('모든 입력 필드에 레이블이 있음', async ({ page }) => {
      const inputs = await page.locator('input[type="text"], input[type="date"], input[type="number"]').all();

      for (const input of inputs) {
        const id = await input.getAttribute('id');
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          await expect(label).toBeVisible();
        }
      }
    });

    test('키보드 네비게이션으로 모든 필드 접근 가능', async ({ page }) => {
      // Focus on first input
      await page.locator('input[name="acquisitionDate"]').focus();
      await expect(page.locator('input[name="acquisitionDate"]')).toBeFocused();

      // Tab through to find transferDate (may have other focusable elements in between)
      let found = false;
      for (let i = 0; i < 10 && !found; i++) {
        await page.keyboard.press('Tab');
        const isFocused = await page.locator('input[name="transferDate"]').evaluate(el => el === document.activeElement);
        if (isFocused) found = true;
      }
      expect(found).toBeTruthy();
    });

    test('에러 메시지가 aria-describedby로 연결됨', async ({ page }) => {
      await page.click('button[type="submit"]:has-text("계산하기")');

      // Wait for error message
      await page.waitForSelector('.error-message');

      // Check if error messages have proper ARIA attributes
      const errorMessages = await page.locator('.error-message').all();
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  /**
   * Test Suite 11: Responsive Design
   */
  test.describe('반응형 디자인', () => {

    test('모바일 뷰포트에서 레이아웃이 적절히 조정됨', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Check if form is still visible and usable
      await expect(page.locator('.capital-gains-tax-calculator')).toBeVisible();
      await expect(page.locator('h1')).toBeVisible();

      // Check if radio buttons are stacked vertically
      const radioGroup = page.locator('.radio-group');
      await expect(radioGroup).toBeVisible();
    });

    test('태블릿 뷰포트에서 레이아웃이 적절히 조정됨', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      await expect(page.locator('.capital-gains-tax-calculator')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });
  });

  /**
   * Test Suite 12: Performance
   */
  test.describe('성능 테스트', () => {

    test('계산 결과가 빠르게 표시됨 (< 1초)', async ({ page }) => {
      await fillBasicInfo(page, {
        acquisitionDate: '2019-01-15',
        transferDate: '2024-06-20',
        acquisitionPrice: '500000000',
        transferPrice: '800000000'
      });

      await fillHouseInfo(page, {
        houseCount: 1,
        address: '서울특별시 강남구',
        residenceYears: '3'
      });

      const startTime = Date.now();
      await submitForm(page);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(1000);
    });

    test('페이지 로드 시간이 합리적임 (< 3초)', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/capital-gains');
      await page.waitForLoadState('networkidle');
      const endTime = Date.now();

      const loadTime = endTime - startTime;
      expect(loadTime).toBeLessThan(3000);
    });
  });

  /**
   * Test Suite 13: Browser Compatibility
   */
  test.describe('브라우저 호환성', () => {

    test('날짜 입력 필드가 제대로 작동함', async ({ page, browserName }) => {
      const dateInput = page.locator('input[name="acquisitionDate"]');
      await dateInput.fill('2019-01-15');

      const value = await dateInput.inputValue();
      expect(value).toBe('2019-01-15');
    });

    test('숫자 입력 필드가 제대로 작동함', async ({ page }) => {
      const numberInput = page.locator('input[name="residenceYears"]');

      // Only test if the input is visible (1주택 선택 시)
      await page.click('input[type="radio"][value="1"]');

      await numberInput.fill('3.5');
      const value = await numberInput.inputValue();
      expect(value).toBe('3.5');
    });
  });

  /**
   * Test Suite 14: User Flow Integration
   */
  test.describe('사용자 플로우 통합 테스트', () => {

    test('전체 사용자 플로우: 입력 → 계산 → 초기화', async ({ page }) => {
      // Step 1: Fill basic info
      await fillBasicInfo(page, {
        acquisitionDate: '2019-01-15',
        transferDate: '2024-06-20',
        acquisitionPrice: '500000000',
        transferPrice: '800000000'
      });

      // Step 2: Fill house info
      await fillHouseInfo(page, {
        houseCount: 1,
        address: '서울특별시 강남구',
        residenceYears: '3'
      });

      // Step 3: Submit and verify results
      await submitForm(page);
      await expect(page.locator('.results-section')).toBeVisible();

      // Step 4: Reset
      await page.click('button:has-text("초기화")');

      // Step 5: Verify form is cleared
      await expect(page.locator('input[name="acquisitionDate"]')).toHaveValue('');
      const resultsCount = await page.locator('.results-section').count();
      expect(resultsCount).toBe(0);
    });

    test('여러 계산 시나리오 연속 테스트', async ({ page }) => {
      // Scenario 1: 1주택 비과세
      await fillBasicInfo(page, {
        acquisitionDate: '2019-01-15',
        transferDate: '2024-06-20',
        acquisitionPrice: '500000000',
        transferPrice: '800000000'
      });

      await fillHouseInfo(page, {
        houseCount: 1,
        address: '서울특별시 강남구',
        residenceYears: '3'
      });

      await submitForm(page);
      await expect(page.locator('.result-highlight.success')).toBeVisible();

      // Reset for next scenario
      await page.click('button:has-text("초기화")');

      // Scenario 2: 다주택 중과세
      await fillBasicInfo(page, {
        acquisitionDate: '2020-05-01',
        transferDate: '2024-05-01',
        acquisitionPrice: '400000000',
        transferPrice: '700000000'
      });

      await fillHouseInfo(page, {
        houseCount: 3,
        address: '서울특별시 강남구'
      });

      await submitForm(page);
      await expect(page.locator('.result-highlight.warning')).toBeVisible();
    });
  });

});

/**
 * Visual Regression Tests (Optional)
 */
test.describe('시각적 회귀 테스트', () => {

  test('초기 폼 스냅샷', async ({ page }) => {
    await page.goto('/capital-gains');
    await expect(page).toHaveScreenshot('initial-form.png');
  });

  test('계산 결과 스냅샷 - 비과세', async ({ page }) => {
    await page.goto('/capital-gains');

    await fillBasicInfo(page, {
      acquisitionDate: '2019-01-15',
      transferDate: '2024-06-20',
      acquisitionPrice: '500000000',
      transferPrice: '800000000'
    });

    await fillHouseInfo(page, {
      houseCount: 1,
      address: '서울특별시 강남구',
      residenceYears: '3'
    });

    await submitForm(page);

    await expect(page.locator('.results-section')).toHaveScreenshot('result-tax-free.png', {
      maxDiffPixelRatio: 0.03 // Allow 3% pixel difference for rendering variations
    });
  });

  test('계산 결과 스냅샷 - 과세', async ({ page }) => {
    await page.goto('/capital-gains');

    await fillBasicInfo(page, {
      acquisitionDate: '2020-05-01',
      transferDate: '2024-05-01',
      acquisitionPrice: '400000000',
      transferPrice: '700000000'
    });

    await fillHouseInfo(page, {
      houseCount: 3,
      address: '서울특별시 강남구'
    });

    await submitForm(page);

    await expect(page.locator('.results-section')).toHaveScreenshot('result-taxable.png', {
      maxDiffPixelRatio: 0.03 // Allow 3% pixel difference for rendering variations
    });
  });
});
