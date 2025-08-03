import { getSensorReadings, getTemperatureColor } from '../services/siloData';
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
      <div className="w-32 bg-lab-cylinder border-2 border-gray-400 rounded-lg p-2">
        <div className="text-xs font-bold text-center text-lab-text mb-2">
          Cylinder Sensors
        </div>
        <div className="text-xs text-center text-lab-text mb-3">
          Silo {selectedSilo || 112}
        </div>
        
        {readingSilo ? (
          <div className="flex items-center justify-center h-32">
            <div className="reading-spinner w-6 h-6 border-2 border-white border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-1">
            {getSensorReadings(selectedSilo || 112).map((reading, sensorIndex) => (
              <div key={sensorIndex} className="flex justify-between items-center bg-white bg-opacity-20 rounded px-2 py-1">
                <span className="text-xs font-medium text-lab-text">S{sensorIndex + 1}:</span>
                <span className="text-xs font-bold text-lab-text">{reading.toFixed(1)}°C</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};