import { test } from '@playwright/test';
import { loadTestCases } from '../../src/excel/loader';
import { runTestCase } from '../../src/runner/test-case-runner';

const testCases = loadTestCases();

test.describe('Excel-Driven Automated Testing Suite', () => {
  for (const testCase of testCases) {
    test(`[${testCase.id}] ${testCase.description}`, async ({ page }) => {
      await runTestCase(page, testCase);
    });
  }
});
