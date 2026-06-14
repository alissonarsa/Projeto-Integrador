import { render, screen } from '@testing-library/react';
import { AlertsPage } from '../pages/AlertsPage';
import { MockDashboardClient } from '../data/mockDashboardClient';

test('renderiza alerta concreto de umidade crítica', async () => {
  render(<AlertsPage client={new MockDashboardClient({ delayMs: 0 })} />);
  expect(await screen.findByText(/Umidade do solo em 28%/i)).toBeInTheDocument();
  expect(await screen.findByText(/WF-03 — Alertas/i)).toBeInTheDocument();
});
