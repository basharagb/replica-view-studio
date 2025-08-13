import { getSensorReadings, getTemperatureColor, findSiloByNumber } from '../services/siloData';
import { Silo } from '../types/silo';
import React from 'react';

interface LabCylinderProps {
  selectedSilo?: number;
  readingSilo?: number | null;
  onSiloClick?: (number: number, temp: number) => void;
  // LabCylinder is completely independent of hover state
  // Only shows readings for selected or reading silo
}

const LabCylinderComponent = ({
  selectedSilo,
  readingSilo,
  onSiloClick
}: LabCylinderProps) => {
  // Get the current silo being displayed (only selected or reading silo, not hovered)
  // Use a stable reference to prevent unnecessary re-renders
  const currentSiloNum = readingSilo || selectedSilo || 112;
  const currentSilo = findSiloByNumber(currentSiloNum);
  const sensorReadings = getSensorReadings(currentSiloNum);

  // Component render logic

  const handleClick = (silo: Silo) => {
    if (onSiloClick) {
      onSiloClick(silo.num, silo.temp);
    }
  };

  // LabCylinder doesn't respond to hovers - only shows selected/reading silo
  // const handleMouseEnter = (silo: Silo, event: React.MouseEvent) => {
  //   if (onSiloHover) {
  //     onSiloHover(silo.num, silo.temp, event);
  //   }
  // };

  return (
    <div className="relative" style={{ height: '95%', minHeight: '325px' }}>
      <div className="bg-lab-cylinder border-2 border-gray-400 rounded-lg" style={{ width: '128px', padding: '6px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} data-testid="lab-cylinder">
        <div className="text-xs font-bold text-center text-lab-text" style={{ marginBottom: '6px' }}>
          Silo Sensors
        </div>
        <div className="text-xs text-center text-lab-text" style={{ marginBottom: '10px' }}>
          {readingSilo ? (
            <span className="text-blue-600 font-bold animate-pulse">
              Reading Silo {readingSilo === 1 ? 1 : readingSilo - 1}
            </span>
          ) : (
            <span>Silo {selectedSilo || 112}</span>
          )}
        </div>
        
        {/* Display main temperature based on current sensor readings (API-aware) */}
        <div className="text-center" style={{ marginBottom: '6px' }}>
          <div className="text-xs text-lab-text">Main Temp:</div>
          <div className={`text-sm font-bold ${
            readingSilo ? 'text-blue-600 animate-pulse' : 'text-lab-text'
          }`}>
            {(sensorReadings.length ? Math.max(...sensorReadings) : (currentSilo?.temp ?? 0)).toFixed(1)}°C
          </div>
        </div>
        
        <div className="flex flex-col" style={{ gap: '3px', flex: 1, overflow: 'hidden' }}>
          {sensorReadings.map((reading, index) => {
            const sensorLabel = index + 1; // S1 at top, S8 at bottom to align with L1-L8
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
              <div key={sensorLabel} className={`flex justify-between items-center rounded px-2 transition-all duration-300 ${getBackgroundClass()}`} style={{ height: '20px', paddingTop: '2px', paddingBottom: '2px' }}>
                {readingSilo && (
                  <div className="absolute inset-0 bg-blue-100 bg-opacity-40 rounded"></div>
                )}
                <span className="text-xs font-medium text-lab-text relative z-10">S{sensorLabel}:</span>
                <span className={`text-xs font-bold relative z-10 ${
                  readingSilo ? 'text-blue-600' : 'text-lab-text'
                }`}>
                  {readingSilo ? (
                    <span className="inline-flex items-center">
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

// Export with React.memo to prevent unnecessary re-renders
export const LabCylinder = React.memo(LabCylinderComponent);