export function escapeCsvValue(value: unknown): string {
  let raw = String(value ?? '');
  // Neutraliza CSV/formula injection: Excel/Sheets executam células que começam
  // com = + - @ (ou tab/CR). Prefixar com aspa simples força o conteúdo a texto.
  if (/^[=+\-@\t\r]/.test(raw)) {
    raw = `'${raw}`;
  }
  const escaped = raw.replace(/"/g, '""');
  return /[",\n;]/.test(raw) ? `"${escaped}"` : escaped;
}

export function toCsv<T extends Record<string, unknown>>(rows: T[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const body = rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(';'));
  return [headers.join(';'), ...body].join('\n');
}
