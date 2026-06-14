import type { DashboardClient } from './types';
import { HttpDashboardClient } from './httpDashboardClient';
import { MockDashboardClient } from './mockDashboardClient';

export function getDashboardClient(): DashboardClient {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  if (baseUrl) {
    return new HttpDashboardClient(baseUrl);
  }
  return new MockDashboardClient();
}
