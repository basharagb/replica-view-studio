import { cylinderSilos, getTemperatureColor } from '../services/siloData';
import { Silo } from '../types/silo';

interface LabCylinderProps {
  selectedSilo?: number;
  readingSilo?: number | null;
  hoveredSilo?: Silo | null;
  onSiloClick?: (number: number, temp: number) => void;
  onSiloHover?: (number: number, temp: number, event: React.MouseEvent) => void;
  onSiloLeave?: () => void;
  onSiloMouseMove?: (event: React.MouseEvent) => void;
}

export const LabCylinder = ({
  selectedSilo,
  readingSilo,
  hoveredSilo,
  onSiloClick,
  onSiloHover,
  onSiloLeave,
  onSiloMouseMove
}: LabCylinderProps) => {
  const handleClick = (silo: Silo) => {
    if (onSiloClick) {
      onSiloClick(silo.num, silo.temp);
    }
  };

  const handleMouseEnter = (silo: Silo, event: React.MouseEvent) => {
    if (onSiloHover) {
      onSiloHover(silo.num, silo.temp, event);
    }
  };

  return (
    <div className="relative">
      <div className="w-20 h-64 bg-lab-cylinder border-2 border-gray-400 rounded-lg flex flex-col justify-between items-center py-2">
        {cylinderSilos.map((silo, index) => {
          const temperatureColor = getTemperatureColor(silo.temp);
          const colorClass = `temp-${temperatureColor}`;
          
          return (
            <div
              key={index}
              className={`
                ${colorClass}
                w-16 h-7
                flex items-center justify-center
                text-xs font-semibold text-lab-text
                border border-gray-300 rounded
                cursor-pointer
                transition-all duration-200
                user-select-none
                ${selectedSilo === silo.num ? 'silo-selected' : ''}
                ${readingSilo === silo.num ? 'silo-reading' : ''}
                ${hoveredSilo?.num === silo.num ? 'silo-hover' : ''}
              `}
              onClick={() => handleClick(silo)}
              onMouseEnter={(e) => handleMouseEnter(silo, e)}
              onMouseLeave={onSiloLeave}
              onMouseMove={onSiloMouseMove}
            >
              {readingSilo === silo.num ? (
                <div className="reading-spinner w-3 h-3 border border-white border-t-transparent"></div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="text-xs font-bold">{silo.num}</div>
                  <div className="text-xs">{silo.temp.toFixed(1)}°C</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};