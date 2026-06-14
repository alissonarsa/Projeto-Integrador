import { toSparklinePath } from '../utils/sparkline';

export function Sparkline({ values, label, unit }: { values: Array<number | null>; label: string; unit: string }) {
  const path = toSparklinePath(values, 220, 48);
  const ultimo = values.filter((value): value is number => value !== null).slice(-1)[0] ?? null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-slate-700">{label}</h3>
        <span className="text-xs text-slate-500">{ultimo !== null ? `${ultimo}${unit}` : '—'}</span>
      </div>
      <svg viewBox="0 0 220 48" className="mt-3 h-20 w-full" role="img" aria-label={label}>
        <path d={path} fill="none" stroke="#0f766e" strokeWidth="2.5" />
      </svg>
    </div>
  );
}
