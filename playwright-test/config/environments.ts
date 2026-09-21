import path from 'path';

export const environments = {
  inputWorkbook: path.resolve(__dirname, '../test-data/input/test-cases.xlsx'),
  reportWorkbook: path.resolve(__dirname, '../artifacts/reports/Test_Report.xlsx'),
} as const;
