export function resolveSelector(type: string | undefined, value: string | undefined): string {
  if (!type || !value) return '';
  const normalized = type.toLowerCase().trim();
  const selector = value.trim();
  if (normalized === 'id') return `#${selector}`;
  if (normalized === 'css') return selector;
  if (normalized === 'xpath') return `xpath=${selector}`;
  return selector;
}
