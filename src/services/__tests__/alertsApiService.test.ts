// Test file for alerts API service
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchActiveAlerts, formatAlertTimestamp, formatAlertDuration, clearAlertsCache } from '../alertsApiService';

// Mock fetch globally
global.fetch = vi.fn();

describe('alertsApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAlertsCache();
  });

  describe('fetchActiveAlerts', () => {
    it('should fetch and process alerts correctly', async () => {
      const mockApiResponse = [
        {
          silo_group: "Group 10",
          silo_number: 195,
          cable_number: null,
          level_0: 23.81,
          color_0: "#46d446",
          level_1: 23.5,
          color_1: "#46d446",
          level_2: 23.5,
          color_2: "#46d446",
          level_3: 23.56,
          color_3: "#46d446",
          level_4: 23.75,
          color_4: "#46d446",
          level_5: 23.75,
          color_5: "#46d446",
          level_6: 23.94,
          color_6: "#46d446",
          level_7: 23.88,
          color_7: "#46d446",
          silo_color: "#46d446",
          timestamp: "2025-10-08T11:45:22",
          alert_type: "disconnect",
          affected_levels: [0],
          active_since: "2025-10-08T11:45:22"
        }
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const alerts = await fetchActiveAlerts();

      expect(alerts).toHaveLength(1);
      expect(alerts[0]).toMatchObject({
        siloNumber: 195,
        siloGroup: "Group 10",
        alertType: "disconnect",
        affectedLevels: [0],
        maxTemp: 23.94,
      });
      expect(alerts[0].timestamp).toBeInstanceOf(Date);
      expect(alerts[0].activeSince).toBeInstanceOf(Date);
      expect(alerts[0].duration).toBeDefined();
    });

    it('should handle empty API response', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const alerts = await fetchActiveAlerts();
      expect(alerts).toHaveLength(0);
    });

    it('should handle API errors gracefully', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const alerts = await fetchActiveAlerts();
      expect(alerts).toHaveLength(0);
    });
  });

  describe('formatAlertTimestamp', () => {
    it('should format timestamp correctly', () => {
      const date = new Date('2025-10-08T11:45:22');
      const formatted = formatAlertTimestamp(date);
      
      expect(formatted).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
    });
  });

  describe('formatAlertDuration', () => {
    it('should format duration correctly for minutes', () => {
      const activeSince = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
      const duration = formatAlertDuration(activeSince);
      
      expect(duration).toBe('30m');
    });

    it('should format duration correctly for hours', () => {
      const activeSince = new Date(Date.now() - 2.5 * 60 * 60 * 1000); // 2.5 hours ago
      const duration = formatAlertDuration(activeSince);
      
      expect(duration).toBe('2h 30m');
    });

    it('should format duration correctly for days', () => {
      const activeSince = new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000); // 1.5 days ago
      const duration = formatAlertDuration(activeSince);
      
      expect(duration).toBe('1d 12h');
    });
  });
});
