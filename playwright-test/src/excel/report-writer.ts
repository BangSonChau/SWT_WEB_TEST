import ExcelJS from 'exceljs';
import { environments } from '../../config/environments';
import { TestCaseResult } from './types';

export async function writeExcelReport(results: Record<string, TestCaseResult>): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(environments.reportWorkbook);
  const sheet = workbook.getWorksheet('Infomation') || workbook.getWorksheet('Q3') || workbook.worksheets[0];
  if (!sheet) return;

  const values = Object.values(results);
  const passCount = values.filter((item) => item.status === 'PASSED').length;
  const failCount = values.filter((item) => item.status === 'FAILED').length;
  const totalCases = Object.keys(results).length || 4;
  const percentComplete = totalCases ? Math.round(((passCount + failCount) / totalCases) * 100) : 0;
  const untestedCount = Math.max(0, totalCases - passCount - failCount);

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > 4) return;
    row.eachCell((cell) => {
      const value = String(cell.value || '').trim();
      if (value.startsWith('Pass:')) cell.value = `Pass: ${passCount}`;
      else if (value.startsWith('Fail:')) cell.value = `Fail: ${failCount}`;
      else if (value.startsWith('Percent Complete:')) cell.value = `Percent Complete: ${percentComplete}%`;
      else if (value.startsWith('Untested:')) cell.value = `Untested: ${untestedCount}`;
      else if (value.startsWith('Number of cases:')) cell.value = `Number of cases: ${totalCases}`;
    });
  });

  let idColumn = 1, statusColumn = 7, dateColumn = 8, noteColumn = 9;
  sheet.eachRow((row) => row.eachCell((cell, column) => {
    const value = String(cell.value || '').trim().toLowerCase();
    if (value === 'id' || value === 'stt test case') idColumn = column;
    if (value === 'status') statusColumn = column;
    if (value.includes('test date')) dateColumn = column;
    if (value === 'note' || value === 'ghi chú') noteColumn = column;
  }));
  sheet.getColumn(noteColumn).width = 52;
  const date = new Date();
  const dateText = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  const border = { top: { style: 'thin' as const }, left: { style: 'thin' as const }, bottom: { style: 'thin' as const }, right: { style: 'thin' as const } };

  sheet.eachRow((row) => {
    const id = String(row.getCell(idColumn).value || '').trim();
    const result = results[id];
    if (!result) return;
    const passed = result.status === 'PASSED';
    row.height = passed ? 45 : 65;
    row.getCell(statusColumn).value = result.status;
    row.getCell(statusColumn).style = { ...row.getCell(statusColumn).style, font: { name: 'Calibri', size: 11, bold: true, color: { argb: passed ? 'FF00B050' : 'FFFF0000' } }, alignment: { vertical: 'middle', horizontal: 'center' }, border };
    row.getCell(dateColumn).value = dateText;
    row.getCell(dateColumn).style = { ...row.getCell(dateColumn).style, alignment: { vertical: 'middle', horizontal: 'center' }, border };
    row.getCell(noteColumn).value = result.noteMessage;
    row.getCell(noteColumn).style = { ...row.getCell(noteColumn).style, font: { name: 'Calibri', size: 10, color: { argb: passed ? 'FF385723' : 'FFC00000' } }, alignment: { vertical: 'middle', horizontal: 'left', wrapText: true }, border };
  });
  await workbook.xlsx.writeFile(environments.reportWorkbook);
}
