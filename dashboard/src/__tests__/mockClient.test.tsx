import { MockDashboardClient } from '../data/mockDashboardClient';

test('retorna canteiros e leituras realistas no modo padrão', async () => {
  const client = new MockDashboardClient({ delayMs: 0 });
  const canteiros = await client.getCanteiros();
  const leituras = await client.getLeiturasUltimas();
  expect(canteiros.length).toBeGreaterThanOrEqual(3);
  expect(leituras.length).toBe(canteiros.length);
  expect(leituras.some((l) => l.umidadeSolo === null)).toBe(true);
});

test('lança erro quando configurado para falhar (simula API offline)', async () => {
  const client = new MockDashboardClient({ delayMs: 0, fail: true });
  await expect(client.getCanteiros()).rejects.toThrow();
});
