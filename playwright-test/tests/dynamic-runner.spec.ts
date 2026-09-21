import { test, expect } from '@playwright/test';
import * as xlsx from 'xlsx';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const EXCEL_PATH = path.resolve(__dirname, '../test-case.xlsx');

const workbook = xlsx.readFile(EXCEL_PATH);
const sheetName = workbook.SheetNames.includes('Steps') ? 'Steps' : workbook.SheetNames[1];
const sheet = workbook.Sheets[sheetName];
const rows: any[] = xlsx.utils.sheet_to_json(sheet);

const testCases: Record<string, any[]> = {};
rows.forEach((row) => {
  const tcId = row.TC_ID;
  if (!tcId) return;
  if (!testCases[tcId]) testCases[tcId] = [];
  testCases[tcId].push(row);
});

function resolveSelector(type: string, value: string) {
  if (!type || !value) return '';
  const t = type.toLowerCase().trim();
  if (t === 'id') return `#${value.trim()}`;
  if (t === 'css') return value.trim();
  if (t === 'xpath') return `xpath=${value.trim()}`;
  return value.trim();
}

test.describe('Excel-Driven Automated Testing Suite', () => {
  for (const [tcId, steps] of Object.entries(testCases)) {
    test(`[${tcId}] ${steps[0]?.Description || ''}`, async ({ page }) => {
      for (const step of steps) {
        const action = (step.Action || '').toUpperCase().trim();
        const selector = resolveSelector(step.Locator_Type, step.Locator_Value);
        let val = step.Value !== undefined ? String(step.Value).trim() : '';
        const expected = step.Expected !== undefined ? String(step.Expected).trim() : '';

        if (action === 'GOTO' && val.includes('https://myweb.com')) {
          val = val.replace('https://myweb.com', BASE_URL);
        }

        try {
          switch (action) {
            case 'GOTO':
              await page.goto(val);
              break;

            case 'INPUT':
              await page.locator(selector).fill(val, { timeout: 3000 });
              break;

            case 'CLICK':
              await page.locator(selector).click({ timeout: 3000 });
              break;

            case 'ASSERT_URL':
              await page.waitForTimeout(600);
              if (expected === '/') {
                await expect(page).toHaveURL(/localhost:5173\/?$/, { timeout: 3000 });
              } else {
                await expect(page).toHaveURL(new RegExp(expected), { timeout: 3000 });
              }
              break;

            case 'ASSERT_TEXT':
              const target = page.locator(selector);
              await expect(target).toBeVisible({ timeout: 3000 });
              await expect(target).toHaveText(expected, { timeout: 3000 });
              break;

            default:
              throw new Error(`Action "${action}" không được hỗ trợ`);
          }
        } catch {
          // Trình bày lỗi theo từng dòng rõ ràng
          let formattedError = '';

          if (action === 'ASSERT_URL') {
            formattedError = `❌ Lỗi tại Bước ${step.Step} (ASSERT_URL)\n• Thực tế: "${page.url()}"\n• Kỳ vọng: "${expected}"`;
          } else if (action === 'ASSERT_TEXT') {
            const actualText = await page.locator(selector).innerText().catch(() => 'Không tìm thấy thẻ');
            formattedError = `❌ Lỗi tại Bước ${step.Step} (ASSERT_TEXT)\n• Thực tế: "${actualText.trim()}"\n• Kỳ vọng: "${expected}"`;
          } else if (action === 'CLICK' || action === 'INPUT') {
            formattedError = `❌ Lỗi tại Bước ${step.Step} (${action})\n• Thao tác thất bại với: "${step.Locator_Value}"\n• Nguyên nhân: Quá thời gian chờ (Timeout) hoặc sai Selector`;
          } else {
            formattedError = `❌ Lỗi tại Bước ${step.Step} (${action})\n• Không thể hoàn thành bước này`;
          }

          throw new Error(formattedError);
        }
      }
    });
  }
});