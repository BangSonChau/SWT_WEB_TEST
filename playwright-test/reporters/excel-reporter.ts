import { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import ExcelJS from 'exceljs';
import path from 'path';

interface TestCaseInfo {
  status: 'PASSED' | 'FAILED';
  noteMessage: string;
}

export default class ExcelReporter implements Reporter {
  private testCaseResults: Record<string, TestCaseInfo> = {};

  onTestEnd(test: TestCase, result: TestResult) {
    const match = test.title.match(/\[(.*?)\]/);
    const tcId = match ? match[1] : test.title;

    const isPassed = result.status === 'passed';
    let note = '✔ Đạt chuẩn (Không phát hiện lỗi)';

    if (!isPassed && result.error) {
      const rawMsg = result.error.message ? result.error.message.replace(/\u001b\[.*?m/g, '') : '';

      // Lấy toàn bộ đoạn text bắt đầu từ ký tự ❌
      const errorIndex = rawMsg.indexOf('❌');
      if (errorIndex !== -1) {
        // Cắt bỏ phần stack trace dài dòng phía sau
        const cleanMsg = rawMsg.substring(errorIndex).split('Call log:')[0].split('at ')[0].trim();
        note = cleanMsg;
      } else {
        note = rawMsg.split('\n')[0].trim();
      }
    }

    this.testCaseResults[tcId] = {
      status: isPassed ? 'PASSED' : 'FAILED',
      noteMessage: note
    };
  }

  async onEnd(result: FullResult) {
    const inputPath = path.resolve(process.cwd(), 'test-case.xlsx');
    const outputPath = path.resolve(process.cwd(), 'Test_Report.xlsx');

    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.readFile(inputPath);
    } catch {
      console.error('❌ Không tìm thấy file test-case.xlsx để ghi báo cáo!');
      return;
    }

    const sheet = workbook.getWorksheet('Infomation') || workbook.getWorksheet('Q3') || workbook.worksheets[0];

    // 1. Cập nhật bảng chỉ số thống kê trên đầu
    let passCount = 0;
    let failCount = 0;
    Object.values(this.testCaseResults).forEach((item) => {
      if (item.status === 'PASSED') passCount++;
      if (item.status === 'FAILED') failCount++;
    });

    const totalCases = Object.keys(this.testCaseResults).length || 4;
    const totalExecuted = passCount + failCount;
    const untestedCount = Math.max(0, totalCases - totalExecuted);
    const percentComplete = totalCases > 0 ? Math.round((totalExecuted / totalCases) * 100) : 0;

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber <= 4) {
        row.eachCell((cell) => {
          const val = String(cell.value || '').trim();
          if (val.startsWith('Pass:')) {
            cell.value = `Pass: ${passCount}`;
            cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF00B050' } };
          } else if (val.startsWith('Fail:')) {
            cell.value = `Fail: ${failCount}`;
            cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: failCount > 0 ? 'FFFF0000' : 'FF000000' } };
          } else if (val.startsWith('Percent Complete:')) {
            cell.value = `Percent Complete: ${percentComplete}%`;
            cell.font = { name: 'Calibri', size: 11, bold: true };
          } else if (val.startsWith('Untested:')) {
            cell.value = `Untested: ${untestedCount}`;
            cell.font = { name: 'Calibri', size: 11 };
          } else if (val.startsWith('Number of cases:')) {
            cell.value = `Number of cases: ${totalCases}`;
            cell.font = { name: 'Calibri', size: 11, bold: true };
          }
        });
      }
    });

    // 2. Tìm các cột
    const today = new Date();
    const currentDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    let colIdIdx = 1;
    let colStatusIdx = 7;
    let colDateIdx = 8;
    let colNoteIdx = 9;

    sheet.eachRow((row) => {
      row.eachCell((cell, colNumber) => {
        const val = String(cell.value || '').trim().toLowerCase();
        if (val === 'id' || val === 'stt test case') colIdIdx = colNumber;
        if (val === 'status') colStatusIdx = colNumber;
        if (val.includes('test date')) colDateIdx = colNumber;
        if (val === 'note' || val === 'ghi chú') colNoteIdx = colNumber;
      });
    });

    // Mở rộng cột Note để hiển thị chữ thoải mái
    sheet.getColumn(colNoteIdx).width = 48;

    // 3. Ghi dữ liệu vào từng hàng và format chiều cao
    sheet.eachRow((row) => {
      const idCell = row.getCell(colIdIdx);
      const tcId = String(idCell.value || '').trim();

      if (this.testCaseResults[tcId]) {
        const data = this.testCaseResults[tcId];
        const statusCell = row.getCell(colStatusIdx);
        const dateCell = row.getCell(colDateIdx);
        const noteCell = row.getCell(colNoteIdx);

        // Nâng chiều cao hàng để vừa vặn các dòng text
        row.height = data.status === 'FAILED' ? 62 : 45;

        // Cột Status
        statusCell.value = data.status;
        statusCell.font = {
          name: 'Calibri',
          size: 11,
          bold: true,
          color: { argb: data.status === 'PASSED' ? 'FF00B050' : 'FFFF0000' }
        };
        statusCell.alignment = { vertical: 'middle', horizontal: 'center' };

        // Cột Date
        dateCell.value = currentDate;
        dateCell.alignment = { vertical: 'middle', horizontal: 'center' };

        // Cột Note
        noteCell.value = data.noteMessage;
        noteCell.font = {
          name: 'Calibri',
          size: 10,
          color: { argb: data.status === 'PASSED' ? 'FF385723' : 'FFC00000' }
        };
        noteCell.alignment = {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: true
        };
      }
    });

    await workbook.xlsx.writeFile(outputPath);
    console.log(`\nĐã xuất file báo cáo định dạng chuẩn đẹp: ${outputPath}`);
  }
}