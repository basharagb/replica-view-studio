import React from 'react';
import { LabCircle } from './LabCircle';
import { LabNumberSquare } from './LabNumberSquare';
import { Silo } from '../types/silo';

interface LabGroupProps {
  circles: Silo[];
  squares: number[];
  selectedSilo?: number;
  readingSilo?: number | null;
  hoveredSilo?: Silo | null;
  onSiloClick?: (number: number, temp: number) => void;
  onSiloHover?: (number: number, temp: number, event: React.MouseEvent) => void;
  onSiloLeave?: () => void;
  onSiloMouseMove?: (event: React.MouseEvent) => void;
}

const LabGroupComponent = ({
  circles,
  squares,
  selectedSilo,
  readingSilo,
  hoveredSilo,
  onSiloClick,
  onSiloHover,
  onSiloLeave,
  onSiloMouseMove
}: LabGroupProps) => {
  return (
    <div className="relative flex flex-col items-center gap-0">
      {/* Top row of circles - exactly 3 circles */}
      <div className="flex gap-0">
        {circles.slice(0, 3).map((circle, index) => (
          <LabCircle
            key={`top-${circle.num}`}
            number={circle.num}
            temp={circle.temp}
            isSelected={selectedSilo === circle.num}
            isReading={readingSilo === circle.num}
            isHovered={hoveredSilo?.num === circle.num}
            onClick={onSiloClick}
            onMouseEnter={onSiloHover}
            onMouseLeave={onSiloLeave}
            onMouseMove={onSiloMouseMove}
          />
        ))}
      </div>
      
      {/* Middle row with squares - exactly 5 squares */}
      <div className="flex gap-0">
        {squares.slice(0, 5).map((num, index) => (
          <LabNumberSquare
            key={`square-${num}`}
            number={num}
            isSelected={selectedSilo === num}
            isReading={readingSilo === num}
            isHovered={hoveredSilo?.num === num}
            onClick={onSiloClick}
            onMouseEnter={onSiloHover}
            onMouseLeave={onSiloLeave}
            onMouseMove={onSiloMouseMove}
          />
        ))}
      </div>
      
      {/* Bottom row of circles - exactly 3 circles */}
      <div className="flex gap-0">
        {circles.slice(3, 6).map((circle, index) => (
          <LabCircle
            key={`bottom-${circle.num}`}
            number={circle.num}
            temp={circle.temp}
            isSelected={selectedSilo === circle.num}
            isReading={readingSilo === circle.num}
            isHovered={hoveredSilo?.num === circle.num}
            onClick={onSiloClick}
            onMouseEnter={onSiloHover}
            onMouseLeave={onSiloLeave}
            onMouseMove={onSiloMouseMove}
          />
        ))}
      </div>
    </div>
  );
};

// Export with React.memo to prevent unnecessary re-renders
export const LabGroup = React.memo(LabGroupComponent);
