import React from 'react';
import { AlertCircle, CheckCircle, Clock, MapPin } from 'lucide-react';
import { getTemperatureColor, generateEnhancedSensorReadings } from '../services/siloData';
import { SensorReading } from '../types/silo';

interface EnhancedSensorPanelProps {
  siloNumber: number;
  sensorReadings: number[];
  enhancedSensors?: SensorReading[];
  isReading?: boolean;
  className?: string;
}

const EnhancedSensorPanel: React.FC<EnhancedSensorPanelProps> = ({
  siloNumber,
  sensorReadings,
  enhancedSensors,
  isReading = false,
  className = ''
}) => {
  // Generate enhanced sensor data if not provided
  const sensors = enhancedSensors || generateEnhancedSensorReadings(Math.max(...sensorReadings));

  const getCalibrationIcon = (status: string) => {
    switch (status) {
      case 'calibrated':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'needs_calibration':
        return <AlertCircle className="w-3 h-3 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  return (
    <div className={`enhanced-sensor-panel bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">
          Silo {siloNumber} - Sensor Details
        </h3>
        <div className="text-xs text-gray-500">
          {sensors.filter(s => s.isActive).length}/{sensors.length} Active
        </div>
      </div>

      <div className="space-y-2">
        {sensors.map((sensor, index) => {
          const tempColor = getTemperatureColor(sensor.temperature);
          const reading = sensorReadings[index];
          
          return (
            <div 
              key={sensor.id}
              className={`flex items-center justify-between p-2 rounded transition-all duration-300 ${
                isReading ? 'bg-blue-50 border border-blue-200' : `temp-${tempColor} bg-opacity-20`
              } ${!sensor.isActive ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-gray-700">
                    {sensor.id}:
                  </span>
                  {getCalibrationIcon(sensor.calibrationStatus)}
                </div>
                
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <MapPin className="w-3 h-3" />
                  <span>{sensor.position}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className={`text-sm font-bold ${
                    isReading ? 'text-blue-600' : 'text-gray-800'
                  }`}>
                    {isReading ? (
                      <div className="flex items-center gap-1">
                        {reading.toFixed(1)}°C
                      </div>
                    ) : (
                      `${sensor.temperature.toFixed(1)}°C`
                    )}
                  </div>
                  
                  {!isReading && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(sensor.timestamp)}</span>
                    </div>
                  )}
                </div>

                {!sensor.isActive && (
                  <div className="text-xs text-red-500 font-medium">
                    OFFLINE
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary statistics */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-800">
              {Math.max(...sensorReadings).toFixed(1)}°C
            </div>
            <div className="text-xs text-gray-500">Max</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-800">
              {(sensorReadings.reduce((a, b) => a + b, 0) / sensorReadings.length).toFixed(1)}°C
            </div>
            <div className="text-xs text-gray-500">Avg</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-800">
              {Math.min(...sensorReadings).toFixed(1)}°C
            </div>
            <div className="text-xs text-gray-500">Min</div>
          </div>
        </div>
      </div>

      {/* Calibration status summary */}
      <div className="mt-3 flex justify-between text-xs">
        <span className="text-green-600">
          ✓ {sensors.filter(s => s.calibrationStatus === 'calibrated').length} Calibrated
        </span>
        <span className="text-yellow-600">
          ⚠ {sensors.filter(s => s.calibrationStatus === 'needs_calibration').length} Need Cal.
        </span>
        <span className="text-red-600">
          ✗ {sensors.filter(s => s.calibrationStatus === 'error').length} Error
        </span>
      </div>
    </div>
  );
};

export default EnhancedSensorPanel;
