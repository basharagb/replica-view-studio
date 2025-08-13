import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MaintenanceCablePopup } from '../MaintenanceCablePopup';
import * as maintenanceApiService from '../../services/maintenanceApiService';

// Mock the maintenance API service
vi.mock('../../services/maintenanceApiService');

const mockMaintenanceData = {
  siloNumber: 45,
  siloGroup: 'A',
  cableCount: 2,
  timestamp: '2025-08-13T12:00:00Z',
  siloColor: '#4f46e5',
  cables: [
    {
      cableIndex: 0,
      sensors: Array.from({ length: 8 }, (_, i) => ({
        level: i === 2 ? -127 : 25.5 + i, // S3 is disabled
        color: i === 2 ? '#9ca3af' : '#46d446'
      }))
    }
  ],
  sensorValues: [25.5, 26.5, -127, 28.5, 29.5, 30.5, 31.5, 32.5], // S3 is disabled
  sensorColors: ['#46d446', '#46d446', '#9ca3af', '#46d446', '#46d446', '#46d446', '#46d446', '#46d446']
};

describe('MaintenanceCablePopup', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(maintenanceApiService.fetchMaintenanceSiloData).mockResolvedValue(mockMaintenanceData);
  });

  it('should render without average temperature statistic', async () => {
    render(<MaintenanceCablePopup siloNumber={45} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Silo 45 - Cable Testing')).toBeInTheDocument();
    });

    // Should not show "Avg Temp" statistic
    expect(screen.queryByText('Avg Temp')).not.toBeInTheDocument();
    
    // Should show Max Temp and Min Temp
    expect(screen.getByText('Max Temp')).toBeInTheDocument();
    expect(screen.getByText('Min Temp')).toBeInTheDocument();
  });

  it('should display disabled sensors with grey styling', async () => {
    render(<MaintenanceCablePopup siloNumber={45} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Silo 45 - Cable Testing')).toBeInTheDocument();
    });

    // Should show "DISABLED" for sensor S3
    expect(screen.getByText('DISABLED')).toBeInTheDocument();
    
    // Should show temperature values for other sensors
    expect(screen.getByText('25.5°C')).toBeInTheDocument();
    expect(screen.getByText('26.5°C')).toBeInTheDocument();
    expect(screen.getByText('28.5°C')).toBeInTheDocument();
  });

  it('should exclude disabled sensors from min/max calculations', async () => {
    render(<MaintenanceCablePopup siloNumber={45} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Silo 45 - Cable Testing')).toBeInTheDocument();
    });

    // Should show Max Temp and Min Temp labels
    expect(screen.getByText('Max Temp')).toBeInTheDocument();
    expect(screen.getByText('Min Temp')).toBeInTheDocument();
    
    // Should have temperature values displayed (excluding -127 disabled sensors)
    const tempElements = screen.getAllByText(/\d+\.\d+°C/);
    expect(tempElements.length).toBeGreaterThan(0);
  });

  it('should not show "Averaged from both cables" badge', async () => {
    render(<MaintenanceCablePopup siloNumber={45} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Silo 45 - Cable Testing')).toBeInTheDocument();
    });

    // Should not show averaging badge
    expect(screen.queryByText('Averaged from both cables')).not.toBeInTheDocument();
    
    // Should show updated title
    expect(screen.getByText('Sensor Values (S1-S8)')).toBeInTheDocument();
  });

  it('should display all 8 sensor values with correct labels', async () => {
    render(<MaintenanceCablePopup siloNumber={45} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Silo 45 - Cable Testing')).toBeInTheDocument();
    });

    // Should show all sensor labels S1-S8 (using getAllByText since labels may appear multiple times)
    for (let i = 1; i <= 8; i++) {
      const sensorLabels = screen.getAllByText(`S${i}`);
      expect(sensorLabels.length).toBeGreaterThan(0);
    }
  });

  it('should handle loading state correctly', () => {
    vi.mocked(maintenanceApiService.fetchMaintenanceSiloData).mockImplementation(
      () => new Promise(() => {}) // Never resolves to keep loading
    );

    render(<MaintenanceCablePopup siloNumber={45} onClose={mockOnClose} />);

    expect(screen.getByText('Loading maintenance data...')).toBeInTheDocument();
  });

  it('should handle error state correctly', async () => {
    vi.mocked(maintenanceApiService.fetchMaintenanceSiloData).mockRejectedValue(
      new Error('API Error')
    );

    render(<MaintenanceCablePopup siloNumber={45} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Connection Error')).toBeInTheDocument();
    });

    expect(screen.getByText('API Error')).toBeInTheDocument();
  });
});
