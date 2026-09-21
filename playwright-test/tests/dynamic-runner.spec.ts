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
        const locatorType = (step.Locator_Type || '').trim();
        const locatorValue = (step.Locator_Value || '').trim();
        const selector = resolveSelector(locatorType, locatorValue);
        let val = step.Value !== undefined ? String(step.Value).trim() : '';
        const expected = step.Expected !== undefined ? String(step.Expected).trim() : '';

        // 1. Kiểm tra sớm: Bắt lỗi nếu quên nhập Locator_Value trong Excel
        if (['INPUT', 'CLICK', 'ASSERT_TEXT'].includes(action) && !locatorValue) {
          throw new Error(
            `❌ Lỗi tại Bước ${step.Step} (${action})\n` +
            `• Đối tượng: Cột Locator_Value đang để trống!\n` +
            `• Nguyên nhân: Hành động ${action} bắt buộc phải có Locator để định vị phần tử`
          );
        }

        if (action === 'GOTO' && val.includes('https://myweb.com')) {
          val = val.replace('https://myweb.com', BASE_URL);
        }

        try {
          switch (action) {
            case 'GOTO':
              await page.goto(val, { timeout: 6000 });
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
                await expect(page).toHaveURL(/localhost:(5173|5143)\/?$/, { timeout: 3000 });
              } else {
                await expect(page).toHaveURL(new RegExp(expected), { timeout: 3000 });
              }
              break;

            case 'ASSERT_TEXT':
              const target = page.locator(selector);
              // Đợi thẻ hiển thị trước
              await expect(target).toBeVisible({ timeout: 3000 });
              // Kiểm tra nội dung text
              await expect(target).toHaveText(expected, { timeout: 3000 });
              break;

            default:
              throw new Error(`Action "${action}" không được hỗ trợ`);
          }
        } catch (err: any) {
          const rawErr = String(err?.message || '');
          const isTimeout = rawErr.includes('Timeout') || err?.name === 'TimeoutError';
          const isSyntax = rawErr.includes('is not a valid') || rawErr.includes('SyntaxError');

          let formattedError = '';

          // 2. Phân loại chi tiết từng tình huống lỗi
          if (action === 'ASSERT_URL') {
            formattedError = `❌ Lỗi tại Bước ${step.Step} (ASSERT_URL)\n• Thực tế: "${page.url()}"\n• Kỳ vọng: "${expected}" (Cột Expected)`;
          } else if (action === 'ASSERT_TEXT') {
            if (isTimeout) {
              formattedError = `❌ Lỗi tại Bước ${step.Step} (ASSERT_TEXT)\n• Đối tượng: [${locatorType || 'css'} = "${locatorValue}"]\n• Nguyên nhân: Timeout - Thẻ thông báo không xuất hiện trên UI`;
            } else {
              // Thẻ có xuất hiện nhưng sai nội dung chữ bên trong
              const actualText = await page.locator(selector).innerText().catch(() => 'Không thể lấy nội dung');
              formattedError = `❌ Lỗi tại Bước ${step.Step} (ASSERT_TEXT)\n• Thực tế: "${actualText.trim()}"\n• Kỳ vọng: "${expected}" (Cột Expected)`;
            }
          } else if (action === 'CLICK' || action === 'INPUT') {
            let cause = 'Thao tác thất bại';
            if (isSyntax) {
              cause = 'Sai cú pháp Selector tại cột Locator_Type hoặc Locator_Value';
            } else if (isTimeout) {
              cause = 'Timeout - Không tìm thấy phần tử trên UI (kiểm tra lại ID hoặc Selector)';
            }
            formattedError = `❌ Lỗi tại Bước ${step.Step} (${action})\n• Đối tượng: [${locatorType || 'css'} = "${locatorValue}"]\n• Nguyên nhân: ${cause}`;
          } else if (action === 'GOTO') {
            formattedError = `❌ Lỗi tại Bước ${step.Step} (GOTO)\n• URL: "${val}"\n• Nguyên nhân: Không thể truy cập trang web (kiểm tra lại cổng chạy Web)`;
          } else {
            formattedError = `❌ Lỗi tại Bước ${step.Step} (${action})\n• Chi tiết: ${rawErr.split('\n')[0]}`;
          }

          throw new Error(formattedError);
        }
      }
    });
  }
});