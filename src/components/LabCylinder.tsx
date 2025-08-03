import { getSensorReadings, getTemperatureColor, findSiloByNumber } from '../services/siloData';
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
  // Get the current silo being displayed (reading silo takes priority)
  const currentSiloNum = readingSilo || selectedSilo || 112;
  const currentSilo = findSiloByNumber(currentSiloNum);
  const sensorReadings = getSensorReadings(currentSiloNum);

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
      <div className="w-32 bg-lab-cylinder border-2 border-gray-400 rounded-lg p-2" data-testid="lab-cylinder">
        <div className="text-xs font-bold text-center text-lab-text mb-2">
          Cylinder Sensors
        </div>
        <div className="text-xs text-center text-lab-text mb-3">
          {readingSilo ? (
            <span className="text-blue-600 font-bold animate-pulse">Reading Silo {readingSilo}</span>
          ) : (
            <span>Silo {selectedSilo || 112}</span>
          )}
        </div>
        
        {/* Display main temperature if available */}
        {currentSilo && (
          <div className="text-center mb-2">
            <div className="text-xs text-lab-text">Main Temp:</div>
            <div className={`text-sm font-bold ${
              readingSilo ? 'text-blue-600 animate-pulse' : 'text-lab-text'
            }`}>
              {currentSilo.temp.toFixed(1)}°C
            </div>
          </div>
        )}
        
        <div className="space-y-1">
          {sensorReadings.map((reading, sensorIndex) => {
            const tempColor = getTemperatureColor(reading);
            const getBackgroundClass = () => {
              if (readingSilo) {
                // In auto mode, apply a semi-transparent overlay over the temperature color
                return `temp-${tempColor} relative`;
              }
              
              // Use the same temperature color classes as silos
              return `temp-${tempColor}`;
            };

            return (
              <div key={sensorIndex} className={`flex justify-between items-center rounded px-2 py-1 transition-all duration-300 ${getBackgroundClass()}`}>
                {readingSilo && (
                  <div className="absolute inset-0 bg-blue-100 bg-opacity-40 rounded"></div>
                )}
                <span className="text-xs font-medium text-lab-text relative z-10">S{sensorIndex + 1}:</span>
                <span className={`text-xs font-bold relative z-10 ${
                  readingSilo ? 'text-blue-600' : 'text-lab-text'
                }`}>
                  {readingSilo ? (
                    <span className="inline-flex items-center">
                      <div className="w-2 h-2 border border-blue-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                      {reading.toFixed(1)}°C
                    </span>
                  ) : (
                    `${reading.toFixed(1)}°C`
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};