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
    sm: 'w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-xs',
    md: 'w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 text-xs',
    lg: 'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 text-xs sm:text-sm'
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