export interface ExcelTestStep {
  TC_ID?: string;
  Description?: string;
  Step?: string | number;
  Action?: string;
  Locator_Type?: string;
  Locator_Value?: string;
  Value?: string | number | boolean;
  Expected?: string | number | boolean;
  [key: string]: unknown;
}

export interface TestCase {
  id: string;
  description: string;
  steps: ExcelTestStep[];
}

export interface TestCaseResult {
  status: 'PASSED' | 'FAILED';
  noteMessage: string;
}
