import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AlertSiloMonitoring from '../AlertSiloMonitoring';

describe('AlertSiloMonitoring', () => {
  // Mock fetch globally for testing
  const mockFetch = vi.spyOn(global, 'fetch');
  
  beforeEach(() => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        {
          id: 1,
          silo_number: 1,
          timestamp: '2025-07-16T18:54:34',
          level_0: 30.03,
          level_1: 34.25,
          level_2: 32.75,
          level_3: 28.13,
          level_4: 22.57,
          level_5: 27.01,
          level_6: 28.2,
          level_7: 23.75,
          temperature: 30.03,
          status: 'warning'
        }
      ])
    } as any);
  });

  afterEach(() => {
    mockFetch.mockRestore();
  });

  it('renders the alert monitoring header', async () => {
    render(<AlertSiloMonitoring />);
    
    expect(screen.getByText('Alert Silo Monitoring')).toBeInTheDocument();
    expect(screen.getByText(/Real-time monitoring of silos with temperature alerts/)).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<AlertSiloMonitoring />);
    
    expect(screen.getByText('Loading alert silos...')).toBeInTheDocument();
  });

  it('displays alert summary cards after loading', async () => {
    render(<AlertSiloMonitoring />);
    
    await waitFor(() => {
      expect(screen.getByText('Critical Alerts')).toBeInTheDocument();
      expect(screen.getByText('Warning Alerts')).toBeInTheDocument();
      expect(screen.getByText('Total Alert Silos')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('shows alert silos grid after loading', async () => {
    render(<AlertSiloMonitoring />);
    
    await waitFor(() => {
      // Should show silo cards
      const siloElements = screen.getAllByText(/Silo \d+/);
      expect(siloElements.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  });

  it('fetches data from the API', async () => {
    render(<AlertSiloMonitoring />);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('http://idealchiprnd.pythonanywhere.com/readings/by-silo-number')
      );
    }, { timeout: 5000 });
  });
});
