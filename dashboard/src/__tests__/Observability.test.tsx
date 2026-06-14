import { render, screen } from '@testing-library/react';
import App from '../App';
import { getObservabilitySnapshot, resetObservability } from '../utils/observability';

test('gera logs estruturados e métricas mínimas no front', async () => {
  resetObservability();
  render(<App />);
  expect(await screen.findByText(/WF-01 — Dashboard Geral/i)).toBeInTheDocument();
  const snapshot = getObservabilitySnapshot();
  console.log('[observability-evidence]', JSON.stringify(snapshot, null, 2));
  expect(snapshot.logs.length).toBeGreaterThan(0);
  expect(Object.keys(snapshot.metrics.pageRenderMs)).toContain('principal');
});
