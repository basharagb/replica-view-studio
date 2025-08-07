import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AlertSiloMonitoring from '../AlertSiloMonitoring';

// Mock the reportService
vi.mock('../../services/reportService', () => ({
  getAlarmedSilos: vi.fn(() => [
    { number: 1, status: 'Critical' },
    { number: 2, status: 'Warning' },
    { number: 3, status: 'Critical' }
  ])
}));

describe('AlertSiloMonitoring', () => {
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
    }, { timeout: 2000 });
  });

  it('shows alert silos grid after loading', async () => {
    render(<AlertSiloMonitoring />);
    
    await waitFor(() => {
      // Should show silo cards
      const siloElements = screen.getAllByText(/Silo \d+/);
      expect(siloElements.length).toBeGreaterThan(0);
    }, { timeout: 2000 });
  });
});
