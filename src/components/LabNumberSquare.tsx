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
        w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16
        ${colorClass}
        border-2
        border-gray-300
        dark:border-gray-600
        flex
        items-center
        justify-center
        text-xs sm:text-sm md:text-base lg:text-lg
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