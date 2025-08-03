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

export const LabGroup = ({
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
    <div className="relative flex flex-col items-center gap-1">
      {/* Top row of circles */}
      <div className="flex">
        {circles.slice(0, 3).map((circle, index) => (
          <LabCircle
            key={index}
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
      
      {/* Middle row with squares */}
      <div className="flex gap-1 px-2">
        {squares.slice(0, 5).map((num, index) => (
          <LabNumberSquare
            key={index}
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
      
      {/* Bottom row of circles */}
      <div className="flex">
        {circles.slice(3, 6).map((circle, index) => (
          <LabCircle
            key={index + 3}
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