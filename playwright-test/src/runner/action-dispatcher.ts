import { expect } from '@playwright/test';
import { formatStepError } from '../errors/formatter';
import { ActionContext } from './types';
import { resolveSelector } from './selector-resolver';

export async function dispatchAction({ page, step }: ActionContext): Promise<void> {
  const action = String(step.Action || '').toUpperCase().trim();
  const locatorValue = String(step.Locator_Value || '').trim();
  const selector = resolveSelector(step.Locator_Type, locatorValue);
  let value = String(step.Value ?? '').trim();
  const expected = String(step.Expected ?? '').trim();

  if (['INPUT', 'CLICK', 'ASSERT_TEXT'].includes(action) && !locatorValue) {
    throw new Error(`❌ Lỗi tại Bước ${step.Step} (${action})\n• Đối tượng: Cột Locator_Value đang để trống!\n• Nguyên nhân: Hành động ${action} bắt buộc phải có Locator để định vị phần tử`);
  }
  try {
    switch (action) {
      case 'GOTO': await page.goto(value, { timeout: 6000 }); break;
      case 'INPUT': await page.locator(selector).fill(value, { timeout: 3000 }); break;
      case 'CLICK': await page.locator(selector).click({ timeout: 3000 }); break;
      case 'ASSERT_URL':
        await page.waitForTimeout(600);
        if (expected === '/') await expect(page).toHaveURL(/\/?$/, { timeout: 3000 });
        else await expect(page).toHaveURL(new RegExp(expected), { timeout: 3000 });
        break;
      case 'ASSERT_TEXT':
        await expect(page.locator(selector)).toBeVisible({ timeout: 3000 });
        await expect(page.locator(selector)).toHaveText(expected, { timeout: 3000 });
        break;
      default: throw new Error(`Action "${action}" không được hỗ trợ`);
    }
  } catch (error) {
    throw new Error(formatStepError(step, action, error, page.url(), value));
  }
}
