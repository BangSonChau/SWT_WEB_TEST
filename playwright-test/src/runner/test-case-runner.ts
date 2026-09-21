import { Page } from '@playwright/test';
import { TestCase } from '../excel/types';
import { dispatchAction } from './action-dispatcher';

export async function runTestCase(page: Page, testCase: TestCase): Promise<void> {
  for (const step of testCase.steps) await dispatchAction({ page, step });
}
