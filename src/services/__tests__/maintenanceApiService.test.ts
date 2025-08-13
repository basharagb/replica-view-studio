import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchMaintenanceSiloData } from '../maintenanceApiService';

// Mock fetch globally
global.fetch = vi.fn();

describe('maintenanceApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchMaintenanceSiloData', () => {
    it('should handle disabled sensors (-127) correctly for circular silos', async () => {
      const mockApiResponse = {
        silo_number: 45,
        silo_group: 'A',
        cable_0_level_0: 25.5,
        cable_0_level_1: 26.5,
        cable_0_level_2: -127, // Disabled sensor
        cable_0_level_3: 28.5,
        cable_0_level_4: 29.5,
        cable_0_level_5: 30.5,
        cable_0_level_6: 31.5,
        cable_0_level_7: 32.5,
        cable_0_color_0: '#46d446',
        cable_0_color_1: '#46d446',
        cable_0_color_2: '#46d446',
        cable_0_color_3: '#46d446',
        cable_0_color_4: '#46d446',
        cable_0_color_5: '#46d446',
        cable_0_color_6: '#46d446',
        cable_0_color_7: '#46d446',
        cable_1_level_0: 24.5,
        cable_1_level_1: 25.5,
        cable_1_level_2: 26.5,
        cable_1_level_3: 27.5,
        cable_1_level_4: 28.5,
        cable_1_level_5: 29.5,
        cable_1_level_6: 30.5,
        cable_1_level_7: 31.5,
        cable_1_color_0: '#46d446',
        cable_1_color_1: '#46d446',
        cable_1_color_2: '#46d446',
        cable_1_color_3: '#46d446',
        cable_1_color_4: '#46d446',
        cable_1_color_5: '#46d446',
        cable_1_color_6: '#46d446',
        cable_1_color_7: '#46d446'
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockApiResponse]
      } as Response);

      const result = await fetchMaintenanceSiloData(45);

      // Should use Cable 0 values directly (no averaging)
      expect(result.sensorValues).toEqual([25.5, 26.5, -127, 28.5, 29.5, 30.5, 31.5, 32.5]);
      
      // Disabled sensor should have grey color
      expect(result.sensorColors[2]).toBe('#9ca3af');
      
      // Other sensors should have their original colors
      expect(result.sensorColors[0]).toBe('#46d446');
      expect(result.sensorColors[1]).toBe('#46d446');
      expect(result.sensorColors[3]).toBe('#46d446');
    });

    it('should handle disabled sensors (-127) correctly for square silos', async () => {
      const mockApiResponse = {
        silo_number: 85, // Square silo
        silo_group: 'B',
        cable_0_level_0: 25.5,
        cable_0_level_1: -127, // Disabled sensor
        cable_0_level_2: 27.5,
        cable_0_level_3: -127, // Another disabled sensor
        cable_0_level_4: 29.5,
        cable_0_level_5: 30.5,
        cable_0_level_6: 31.5,
        cable_0_level_7: 32.5,
        cable_0_color_0: '#46d446',
        cable_0_color_1: '#46d446',
        cable_0_color_2: '#ff9800',
        cable_0_color_3: '#46d446',
        cable_0_color_4: '#d14141',
        cable_0_color_5: '#46d446',
        cable_0_color_6: '#46d446',
        cable_0_color_7: '#46d446'
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockApiResponse]
      } as Response);

      const result = await fetchMaintenanceSiloData(85);

      // Should use Cable 0 values directly
      expect(result.sensorValues).toEqual([25.5, -127, 27.5, -127, 29.5, 30.5, 31.5, 32.5]);
      
      // Disabled sensors should have grey color
      expect(result.sensorColors[1]).toBe('#9ca3af');
      expect(result.sensorColors[3]).toBe('#9ca3af');
      
      // Other sensors should have their original colors
      expect(result.sensorColors[0]).toBe('#46d446');
      expect(result.sensorColors[2]).toBe('#ff9800');
      expect(result.sensorColors[4]).toBe('#d14141');
    });

    it('should not perform averaging for circular silos', async () => {
      const mockApiResponse = {
        silo_number: 30,
        silo_group: 'A',
        cable_0_level_0: 20.0,
        cable_0_level_1: 21.0,
        cable_0_level_2: 22.0,
        cable_0_level_3: 23.0,
        cable_0_level_4: 24.0,
        cable_0_level_5: 25.0,
        cable_0_level_6: 26.0,
        cable_0_level_7: 27.0,
        cable_0_color_0: '#46d446',
        cable_0_color_1: '#46d446',
        cable_0_color_2: '#46d446',
        cable_0_color_3: '#46d446',
        cable_0_color_4: '#46d446',
        cable_0_color_5: '#46d446',
        cable_0_color_6: '#46d446',
        cable_0_color_7: '#46d446',
        cable_1_level_0: 30.0, // Different values from Cable 0
        cable_1_level_1: 31.0,
        cable_1_level_2: 32.0,
        cable_1_level_3: 33.0,
        cable_1_level_4: 34.0,
        cable_1_level_5: 35.0,
        cable_1_level_6: 36.0,
        cable_1_level_7: 37.0,
        cable_1_color_0: '#d14141',
        cable_1_color_1: '#d14141',
        cable_1_color_2: '#d14141',
        cable_1_color_3: '#d14141',
        cable_1_color_4: '#d14141',
        cable_1_color_5: '#d14141',
        cable_1_color_6: '#d14141',
        cable_1_color_7: '#d14141'
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockApiResponse]
      } as Response);

      const result = await fetchMaintenanceSiloData(30);

      // Should use Cable 0 values directly, not averages
      expect(result.sensorValues).toEqual([20.0, 21.0, 22.0, 23.0, 24.0, 25.0, 26.0, 27.0]);
      
      // Should use Cable 0 colors, not the "more critical" color
      expect(result.sensorColors).toEqual([
        '#46d446', '#46d446', '#46d446', '#46d446', 
        '#46d446', '#46d446', '#46d446', '#46d446'
      ]);
    });

    it('should handle API errors and return simulated data', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchMaintenanceSiloData(45);

      // Should return simulated data structure
      expect(result).toHaveProperty('siloNumber', 45);
      expect(result).toHaveProperty('sensorValues');
      expect(result).toHaveProperty('sensorColors');
      expect(result.sensorValues).toHaveLength(8);
      expect(result.sensorColors).toHaveLength(8);
    });

    it('should handle empty API response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      } as Response);

      const result = await fetchMaintenanceSiloData(45);

      // Should return simulated data when API returns empty array
      expect(result).toHaveProperty('siloNumber', 45);
      expect(result.sensorValues).toHaveLength(8);
      expect(result.sensorColors).toHaveLength(8);
    });
  });
});
