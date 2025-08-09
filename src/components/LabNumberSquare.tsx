import { getSiloColorByNumber, findSiloByNumber } from '../services/siloData';

interface LabNumberSquareProps {
  number: number;
  isSelected?: boolean;
  isReading?: boolean;
  isHovered?: boolean;
  onClick?: (number: number, temp: number) => void;
  onMouseEnter?: (number: number, temp: number, event: React.MouseEvent) => void;
  onMouseLeave?: () => void;
  onMouseMove?: (event: React.MouseEvent) => void;
}

export const LabNumberSquare = ({
  number,
  isSelected = false,
  isReading = false,
  isHovered = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onMouseMove
}: LabNumberSquareProps) => {
  // Find the silo data to get temperature
  const silo = findSiloByNumber(number);
  const temp = silo?.temp || 0;
  const temperatureColor = getSiloColorByNumber(number);
  const colorClass = `temp-${temperatureColor}`;

  const handleClick = () => {
    if (onClick) {
      onClick(number, temp);
    }
  };

  const handleMouseEnter = (event: React.MouseEvent) => {
    if (onMouseEnter) {
      onMouseEnter(number, temp, event);
    }
  };

  return (
    <div
      className={`
        w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10
        ${colorClass}
        border-2
        border-gray-300
        dark:border-gray-600
        flex
        items-center
        justify-center
        text-xs
        font-semibold
        text-lab-text
        cursor-pointer
        transition-all
        duration-300
        hover:scale-110
        active:scale-95
        hover:shadow-lg
        user-select-none
        rounded-md
        ${isSelected ? 'silo-selected' : ''}
        ${isReading ? 'silo-reading' : ''}
        ${isHovered ? 'silo-hover' : ''}
      `}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
    >
      {isReading ? (
        <div className="reading-spinner w-3 h-3 border border-white border-t-transparent"></div>
      ) : (
        number
      )}
    </div>
  );
};