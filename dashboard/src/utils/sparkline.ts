export function toSparklinePath(values: Array<number | null>, width: number, height: number): string {
  const numeric = values.filter((value): value is number => value !== null);
  if (numeric.length === 0) return '';
  const min = Math.min(...numeric);
  const max = Math.max(...numeric);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const safe = value ?? min;
      const y = height - ((safe - min) / range) * height;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}
