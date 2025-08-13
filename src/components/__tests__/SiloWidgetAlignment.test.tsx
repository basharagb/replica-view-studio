import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LabCylinder } from '../LabCylinder';
import { GrainLevelCylinder } from '../GrainLevelCylinder';

// Mock the siloData service
vi.mock('../../services/siloData', () => ({
  getSensorReadings: vi.fn(() => [26.8, 30.1, 30.3, 31.1, 29.5, 29.3, 33.2, 27.9]),
  getTemperatureColor: vi.fn(() => 'green'),
  findSiloByNumber: vi.fn(() => ({ num: 112, temp: 33.2 }))
}));

describe('Silo Widget Alignment', () => {
  it('LabCylinder renders with correct dimensions and spacing', () => {
    render(<LabCylinder selectedSilo={112} />);
    
    const labCylinder = screen.getByTestId('lab-cylinder');
    expect(labCylinder).toBeInTheDocument();
    
    // Check that all 8 sensors are rendered (S1-S8)
    for (let i = 1; i <= 8; i++) {
      expect(screen.getByText(`S${i}:`)).toBeInTheDocument();
    }
    
    // Check header text
    expect(screen.getByText('Silo Sensors')).toBeInTheDocument();
    expect(screen.getByText('Main Temp:')).toBeInTheDocument();
  });

  it('GrainLevelCylinder renders with correct dimensions and spacing', () => {
    render(<GrainLevelCylinder selectedSilo={112} />);
    
    const grainLevelCylinder = screen.getByTestId('grain-level-cylinder');
    expect(grainLevelCylinder).toBeInTheDocument();
    
    // Check that all 8 levels are rendered (L1-L8)
    for (let i = 1; i <= 8; i++) {
      expect(screen.getByText(`L${i}`)).toBeInTheDocument();
    }
    
    // Check header text
    expect(screen.getByText('Grain Level')).toBeInTheDocument();
    expect(screen.getByText('Level:')).toBeInTheDocument();
  });

  it('both widgets have consistent styling for alignment', () => {
    const { rerender } = render(<LabCylinder selectedSilo={112} />);
    const labCylinder = screen.getByTestId('lab-cylinder');
    
    // Check LabCylinder container styles
    const labStyle = window.getComputedStyle(labCylinder);
    expect(labCylinder).toHaveStyle({ padding: '6px' });
    
    rerender(<GrainLevelCylinder selectedSilo={112} />);
    const grainLevelCylinder = screen.getByTestId('grain-level-cylinder');
    
    // Check GrainLevelCylinder container styles
    const grainStyle = window.getComputedStyle(grainLevelCylinder);
    expect(grainLevelCylinder).toHaveStyle({ padding: '6px' });
  });

  it('sensors and levels are ordered correctly for horizontal alignment', () => {
    render(<LabCylinder selectedSilo={112} />);
    
    // Get all sensor elements and verify they're in order S1-S8
    const sensorElements = screen.getAllByText(/S\d+:/);
    expect(sensorElements).toHaveLength(8);
    
    sensorElements.forEach((element, index) => {
      expect(element).toHaveTextContent(`S${index + 1}:`);
    });
  });

  it('grain levels are ordered correctly for horizontal alignment', () => {
    render(<GrainLevelCylinder selectedSilo={112} />);
    
    // Get all level elements and verify they're in order L1-L8
    const levelElements = screen.getAllByText(/L\d+$/);
    expect(levelElements).toHaveLength(8);
    
    levelElements.forEach((element, index) => {
      expect(element).toHaveTextContent(`L${index + 1}`);
    });
  });

  it('both widgets display the same silo number', () => {
    const selectedSilo = 112;
    
    const { unmount } = render(<LabCylinder selectedSilo={selectedSilo} />);
    expect(screen.getByText(`Silo ${selectedSilo}`)).toBeInTheDocument();
    unmount();
    
    render(<GrainLevelCylinder selectedSilo={selectedSilo} />);
    expect(screen.getByText(`Silo ${selectedSilo}`)).toBeInTheDocument();
  });
});
