import { fireEvent, render, screen } from '@testing-library/react';
import { HistoryPage } from '../pages/HistoryPage';
import { MockDashboardClient } from '../data/mockDashboardClient';

test('carrega histórico e expõe ação de exportação csv', async () => {
  const originalCreateElement = document.createElement.bind(document);
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock');
  globalThis.URL.revokeObjectURL = vi.fn();
  const click = vi.fn();
  const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
    if (tagName === 'a') {
      return {
        href: '',
        download: '',
        click
      } as unknown as HTMLAnchorElement;
    }
    return originalCreateElement(tagName);
  });

  render(<HistoryPage client={new MockDashboardClient({ delayMs: 0 })} />);
  expect(await screen.findByText(/WF-02 — Histórico de leituras/i)).toBeInTheDocument();
  const button = await screen.findByRole('button', { name: /Exportar CSV/i });
  fireEvent.click(button);
  expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
  expect(click).toHaveBeenCalled();
  createElementSpy.mockRestore();
});
