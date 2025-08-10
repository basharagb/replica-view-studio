import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AnimatedTemperatureGraph from '../AnimatedTemperatureGraph';

describe('AnimatedTemperatureGraph', () => {
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

  it('renders the graph title', async () => {
    render(<AnimatedTemperatureGraph title="Test Temperature Graph" />);
    
    expect(screen.getByText('Test Temperature Graph')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<AnimatedTemperatureGraph title="Test Graph" />);
    
    expect(screen.getByText('Loading temperature data...')).toBeInTheDocument();
  });

  it('displays statistics cards after loading', async () => {
    render(<AnimatedTemperatureGraph title="Test Graph" />);
    
    await waitFor(() => {
      expect(screen.getByText('Average')).toBeInTheDocument();
      expect(screen.getByText('Max')).toBeInTheDocument();
      expect(screen.getByText('Min')).toBeInTheDocument();
      expect(screen.getByText('Alerts')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('shows refresh button', async () => {
    render(<AnimatedTemperatureGraph title="Test Graph" />);
    
    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('renders with alarm report configuration', async () => {
    render(<AnimatedTemperatureGraph title="Alarm Graph" isAlarmReport={true} />);
    
    expect(screen.getByText('Alarm Graph')).toBeInTheDocument();
  });

  it('fetches data from the API when siloNumber is provided', async () => {
    render(<AnimatedTemperatureGraph title="Test Graph" siloNumber={1} />);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('http://idealchiprnd.pythonanywhere.com/readings/by-silo-number')
      );
    }, { timeout: 5000 });
  });
});
