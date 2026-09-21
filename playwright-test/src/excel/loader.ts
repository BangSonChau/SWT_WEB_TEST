import * as xlsx from 'xlsx';
import { environments } from '../../config/environments';
import { ExcelTestStep, TestCase } from './types';

export function loadTestCases(filePath = environments.inputWorkbook): TestCase[] {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames.includes('Steps') ? 'Steps' : workbook.SheetNames[1];
  if (!sheetName) return [];

  const rows = xlsx.utils.sheet_to_json<ExcelTestStep>(workbook.Sheets[sheetName]);
  const grouped = new Map<string, ExcelTestStep[]>();
  for (const row of rows) {
    const id = String(row.TC_ID || '').trim();
    if (!id) continue;
    const steps = grouped.get(id) || [];
    steps.push(row);
    grouped.set(id, steps);
  }

  return [...grouped.entries()].map(([id, steps]) => ({
    id,
    description: String(steps[0]?.Description || ''),
    steps,
  }));
}
