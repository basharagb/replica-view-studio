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
    sm: 'w-[1.96rem] h-[1.96rem] sm:w-[2.45rem] sm:h-[2.45rem] md:w-[2.94rem] md:h-[2.94rem] lg:w-[3.43rem] lg:h-[3.43rem] xl:w-[3.92rem] xl:h-[3.92rem] text-xs',
    md: 'w-[2.45rem] h-[2.45rem] sm:w-[2.94rem] sm:h-[2.94rem] md:w-[3.43rem] md:h-[3.43rem] lg:w-[3.92rem] lg:h-[3.92rem] xl:w-[4.41rem] xl:h-[4.41rem] text-xs',
    lg: 'w-[2.94rem] h-[2.94rem] sm:w-[3.43rem] sm:h-[3.43rem] md:w-[3.92rem] md:h-[3.92rem] lg:w-[4.41rem] lg:h-[4.41rem] xl:w-[4.9rem] xl:h-[4.9rem] text-xs sm:text-sm'
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