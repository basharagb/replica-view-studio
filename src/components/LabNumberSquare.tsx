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
        w-[1.38rem] h-[1.38rem] sm:w-[1.61rem] sm:h-[1.61rem] md:w-[1.84rem] md:h-[1.84rem] lg:w-[2.07rem] lg:h-[2.07rem] xl:w-[2.3rem] xl:h-[2.3rem]
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