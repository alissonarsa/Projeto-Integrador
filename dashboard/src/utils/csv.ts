export function escapeCsvValue(value: unknown): string {
  const raw = String(value ?? '');
  const escaped = raw.replace(/"/g, '""');
  return /[",\n;]/.test(raw) ? `"${escaped}"` : escaped;
}

export function toCsv<T extends Record<string, unknown>>(rows: T[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const body = rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(';'));
  return [headers.join(';'), ...body].join('\n');
}
