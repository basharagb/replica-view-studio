import { LabCircle } from './LabCircle';
import { LabNumberSquare } from './LabNumberSquare';

interface LabGroupProps {
  circles: Array<{ number: number; color: 'green' | 'yellow' | 'pink' | 'beige' }>;
  squares: number[];
}

export const LabGroup = ({ circles, squares }: LabGroupProps) => {
  return (
    <div className="relative flex flex-col items-center gap-1">
      {/* Top row of circles */}
      <div className="flex gap-1">
        {circles.slice(0, 3).map((circle, index) => (
          <LabCircle key={index} number={circle.number} color={circle.color} />
        ))}
      </div>
      
      {/* Middle row with squares */}
      <div className="flex gap-1 px-2">
        {squares.slice(0, 5).map((num, index) => (
          <LabNumberSquare key={index} number={num} />
        ))}
      </div>
      
      {/* Bottom row of circles */}
      <div className="flex gap-1">
        {circles.slice(3, 6).map((circle, index) => (
          <LabCircle key={index + 3} number={circle.number} color={circle.color} />
        ))}
      </div>
    </div>
  );
};