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
  // Get the silo whose readings should be displayed
  // When scanning silo n, show readings from completed silo (n-1)
  // When not scanning, show selected silo
  const displaySiloNum = readingSilo 
    ? (readingSilo === 1 ? 1 : readingSilo - 1)  // Show previous completed silo
    : (selectedSilo || 112);  // Show selected silo when not scanning
  
  const currentSilo = findSiloByNumber(displaySiloNum);
  const sensorReadings = getSensorReadings(displaySiloNum);

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
    <div className="relative">
      <div className="bg-lab-cylinder border-2 border-gray-400 rounded-lg" style={{ width: '128px', padding: '2px 6px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} data-testid="lab-cylinder">
        {/* Fixed-height header to align with GrainLevelCylinder */}
        <div style={{ height: '56px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <div className="text-xs font-bold text-center text-lab-text" style={{ marginBottom: '2px' }}>
            Silo Sensors
          </div>
          <div className="text-xs text-center text-lab-text" style={{ marginBottom: '2px' }}>
            {readingSilo ? (
              <span className="text-blue-600 font-bold animate-pulse">
                Reading Silo {displaySiloNum}
              </span>
            ) : (
              <span>Silo {displaySiloNum}</span>
            )}
          </div>
          {/* Display main temperature based on current sensor readings (API-aware) */}
          <div className="text-center" style={{ marginBottom: '0px' }}>
            <div className="text-xs text-lab-text">Main Temp:</div>
            <div className={`text-sm font-bold ${
              readingSilo ? 'text-blue-600 animate-pulse' : 'text-lab-text'
            }`}>
              {(sensorReadings.length ? Math.max(...sensorReadings) : (currentSilo?.temp ?? 0)).toFixed(1)}°C
            </div>
          </div>
        </div>
        
        <div className="flex flex-col-reverse" style={{ gap: '3px' }}>
          {sensorReadings.map((reading, index) => {
            const sensorLabel = index + 1; // S1 at bottom, S8 at top (reversed order)
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