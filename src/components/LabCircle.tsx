import { getSiloColorByNumber } from '../services/siloData';
import { TemperatureColor } from '../types/silo';

interface LabCircleProps {
  number: number;
  temp: number;
  size?: 'sm' | 'md' | 'lg';
  isSelected?: boolean;
  isReading?: boolean;
  isHovered?: boolean;
  onClick?: (number: number, temp: number) => void;
  onMouseEnter?: (number: number, temp: number, event: React.MouseEvent) => void;
  onMouseLeave?: () => void;
  onMouseMove?: (event: React.MouseEvent) => void;
}

export const LabCircle = ({
  number,
  temp,
  size = 'md',
  isSelected = false,
  isReading = false,
  isHovered = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onMouseMove
}: LabCircleProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-xs sm:text-sm',
    md: 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-xs sm:text-sm md:text-base',
    lg: 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 text-sm sm:text-base md:text-lg'
  };

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
        ${sizeClasses[size]}
        ${colorClass}
        rounded-full
        flex
        items-center
        justify-center
        font-semibold
        text-lab-text
        border-2
        border-gray-300
        dark:border-gray-600
        shadow-sm
        hover:shadow-lg
        cursor-pointer
        transition-all
        duration-200
        hover:scale-110
        active:scale-95
        user-select-none
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
        <div className="reading-spinner"></div>
      ) : (
        number
      )}
    </div>
  );
};