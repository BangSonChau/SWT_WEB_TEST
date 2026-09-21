import { Page } from '@playwright/test';
import { ExcelTestStep } from '../excel/types';

export interface ActionContext {
  page: Page;
  step: ExcelTestStep;
}
