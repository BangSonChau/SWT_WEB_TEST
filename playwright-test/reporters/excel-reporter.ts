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
      // Làm sạch các mã màu ANSI trong terminal
      const rawMsg = result.error.message ? result.error.message.replace(/\u001b\[.*?m/g, '') : '';

      const errorIndex = rawMsg.indexOf('❌');
      if (errorIndex !== -1) {
        // Cắt bỏ phần Call log và Call Stack một cách an toàn bằng Regex
        const cleanMsg = rawMsg
          .substring(errorIndex)
          .split(/Call log:/i)[0]
          .split(/\n\s*at\s+/)[0]
          .trim();
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

    // 2. Quét tìm vị trí các cột
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

    // Cài độ rộng cột Note thoáng mắt
    sheet.getColumn(colNoteIdx).width = 52;

    // Đường viền chuẩn giữ nét cho bảng tính
    const thinBorder = {
      top: { style: 'thin' as const },
      left: { style: 'thin' as const },
      bottom: { style: 'thin' as const },
      right: { style: 'thin' as const }
    };

    // 3. Ghi dữ liệu vào từng hàng
    sheet.eachRow((row) => {
      const idCell = row.getCell(colIdIdx);
      const tcId = String(idCell.value || '').trim();

      if (this.testCaseResults[tcId]) {
        const data = this.testCaseResults[tcId];
        const statusCell = row.getCell(colStatusIdx);
        const dateCell = row.getCell(colDateIdx);
        const noteCell = row.getCell(colNoteIdx);
        const status = data.status.trim().toUpperCase();
        const isPassedStatus = status === 'PASSED';

        // Tự động nâng chiều cao: dòng có lỗi giãn 65 để chứa 3 dòng text, pass giãn 45
        row.height = isPassedStatus ? 45 : 65;

        // Cột Status
        statusCell.value = status;
        statusCell.style = {
          ...statusCell.style,
          font: {
            name: 'Calibri',
            size: 11,
            bold: true,
            color: { argb: isPassedStatus ? 'FF00B050' : 'FFFF0000' }
          },
          alignment: { vertical: 'middle', horizontal: 'center' },
          border: thinBorder
        };

        // Cột Date
        dateCell.value = currentDate;
        dateCell.style = {
          ...dateCell.style,
          alignment: { vertical: 'middle', horizontal: 'center' },
          border: thinBorder
        };

        // Cột Note
        noteCell.value = data.noteMessage;
        noteCell.style = {
          ...noteCell.style,
          font: {
            name: 'Calibri',
            size: 10,
            color: { argb: isPassedStatus ? 'FF385723' : 'FFC00000' }
          },
          alignment: {
            vertical: 'middle',
            horizontal: 'left',
            wrapText: true
          },
          border: thinBorder
        };
      }
    });

    await workbook.xlsx.writeFile(outputPath);
    console.log(`\n🎉 Đã xuất file báo cáo định dạng chuẩn đẹp: ${outputPath}`);
  }
}