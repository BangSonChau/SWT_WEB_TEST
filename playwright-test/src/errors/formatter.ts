import { ExcelTestStep } from '../excel/types';

export function formatStepError(step: ExcelTestStep, action: string, error: unknown, pageUrl: string, value: string): string {
  const raw = String((error as { message?: string })?.message || error || '');
  const timeout = raw.includes('Timeout') || (error as { name?: string })?.name === 'TimeoutError';
  const syntax = raw.includes('is not a valid') || raw.includes('SyntaxError');
  const stepNumber = step.Step ?? '';
  const type = step.Locator_Type || 'css';
  const locator = step.Locator_Value || '';
  const expected = String(step.Expected ?? '').trim();

  if (action === 'ASSERT_URL') return `❌ Lỗi tại Bước ${stepNumber} (ASSERT_URL)\n• Thực tế: "${pageUrl}"\n• Kỳ vọng: "${expected}" (Cột Expected)`;
  if (action === 'ASSERT_TEXT') {
    if (timeout) return `❌ Lỗi tại Bước ${stepNumber} (ASSERT_TEXT)\n• Đối tượng: [${type} = "${locator}"]\n• Nguyên nhân: Timeout - Thẻ thông báo không xuất hiện trên UI`;
    return `❌ Lỗi tại Bước ${stepNumber} (ASSERT_TEXT)\n• Chi tiết: ${raw.split('\n')[0]}`;
  }
  if (action === 'CLICK' || action === 'INPUT') {
    const cause = syntax ? 'Sai cú pháp Selector tại cột Locator_Type hoặc Locator_Value' :
      timeout ? 'Timeout - Không tìm thấy phần tử trên UI (kiểm tra lại ID hoặc Selector)' : 'Thao tác thất bại';
    return `❌ Lỗi tại Bước ${stepNumber} (${action})\n• Đối tượng: [${type} = "${locator}"]\n• Nguyên nhân: ${cause}`;
  }
  if (action === 'GOTO') return `❌ Lỗi tại Bước ${stepNumber} (GOTO)\n• URL: "${value}"\n• Nguyên nhân: Không thể truy cập trang web (kiểm tra lại cổng chạy Web)`;
  return `❌ Lỗi tại Bước ${stepNumber} (${action})\n• Chi tiết: ${raw.split('\n')[0]}`;
}
