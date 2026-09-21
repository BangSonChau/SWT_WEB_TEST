import { FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { writeExcelReport } from '../src/excel/report-writer';
import { TestCaseResult } from '../src/excel/types';

export default class ExcelReporter implements Reporter {
  private readonly results: Record<string, TestCaseResult> = {};

  onTestEnd(test: TestCase, result: TestResult): void {
    const match = test.title.match(/\[(.*?)\]/);
    const id = match ? match[1] : test.title;
    const raw = result.error?.message?.replace(/\u001b\[.*?m/g, '') || '';
    const errorIndex = raw.indexOf('❌');
    const note = result.status === 'passed'
      ? '✔ Đạt chuẩn (Không phát hiện lỗi)'
      : raw.substring(errorIndex >= 0 ? errorIndex : 0)
        .split(/Call log:/i)[0]
        .split(/\n\s*at\s+/)[0]
        .trim();

    this.results[id] = {
      status: result.status === 'passed' ? 'PASSED' : 'FAILED',
      noteMessage: note
    };
  }

  async onEnd(_result: FullResult): Promise<void> {
    await writeExcelReport(this.results);
    console.log('🎉 Đã xuất file báo cáo Excel.');
  }
}
