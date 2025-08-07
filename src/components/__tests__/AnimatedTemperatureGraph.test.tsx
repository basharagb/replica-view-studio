import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AnimatedTemperatureGraph from '../AnimatedTemperatureGraph';

describe('AnimatedTemperatureGraph', () => {
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
});
