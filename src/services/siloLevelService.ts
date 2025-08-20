// Service to fetch silo fill percent from the level estimate endpoint
import { Strings } from '../utils/Strings';

export interface SiloLevelEstimateResponseItem {
  silo_group: string;
  silo_number: number;
  timestamp: string;
  level_0?: number;
  level_1?: number;
  level_2?: number;
  level_3?: number;
  level_4?: number;
  level_5?: number;
  level_6?: number;
  level_7?: number;
  fill_index_float?: number;
  fill_percent: number; // We only need this
  cluster_means?: {
    air: number;
    material: number;
  }
}

export async function fetchSiloFillPercent(siloNumber: number, timeoutMs = 10000): Promise<number | null> {
  const url = `${Strings.URLS.LEVEL_ESTIMATE_BY_NUMBER}?silo_number=${encodeURIComponent(siloNumber)}&_t=${Date.now()}`;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!response.ok) {
      console.error('Level estimate API error', response.status, response.statusText);
      return null;
    }
    const data: SiloLevelEstimateResponseItem[] = await response.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const item = data[0];
    if (typeof item.fill_percent === 'number' && !Number.isNaN(item.fill_percent)) {
      // Clamp 0..100 just in case
      return Math.max(0, Math.min(100, item.fill_percent));
    }
    return null;
  } catch (e) {
    console.error('Failed to fetch silo fill percent', e);
    return null;
  }
}
