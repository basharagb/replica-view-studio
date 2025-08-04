import React, { useState, useEffect } from 'react';
import { Thermometer, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { TEMPERATURE_THRESHOLDS } from '../services/siloData';

// Sensor reading type
interface SensorReading {
  id: string;
  value: number;
  status: 'green' | 'yellow' | 'red';
}

// Silo status type
interface SiloStatus {
  overallStatus: 'green' | 'yellow' | 'red';
  priority: 'normal' | 'warning' | 'critical';
  sensors: SensorReading[];
}

interface SiloMonitoringSystemProps {
  siloNumber: number;
  className?: string;
}

/**
 * Silo Monitoring System Component
 * 
 * Implements the exact specifications:
 * - Each silo contains exactly 8 sensors
 * - Green: 20.0-34.99, Yellow: 35.0-39.99, Red: 40.0+
 * - Priority hierarchy: Red > Yellow > Green
 * - Overall status determined by highest priority sensor
 */
const SiloMonitoringSystem: React.FC<SiloMonitoringSystemProps> = ({
  siloNumber,
  className = ''
}) => {
  const [siloStatus, setSiloStatus] = useState<SiloStatus | null>(null);

  // Generate random sensor readings for demonstration
  const generateSensorReadings = (): SensorReading[] => {
    const readings: SensorReading[] = [];
    
    for (let i = 1; i <= 8; i++) {
      // Generate random reading between 20-50
      const value = Math.round((Math.random() * 30 + 20) * 10) / 10;
      
      // Determine sensor status based on specifications
      let status: 'green' | 'yellow' | 'red';
      if (value >= TEMPERATURE_THRESHOLDS.RED_MIN) {
        status = 'red';
      } else if (value >= TEMPERATURE_THRESHOLDS.YELLOW_MIN) {
        status = 'yellow';
      } else {
        status = 'green';
      }
      
      readings.push({
        id: `S${i}`,
        value,
        status
      });
    }
    
    return readings;
  };

  // Determine overall silo status based on priority hierarchy
  const determineSiloStatus = (sensors: SensorReading[]): SiloStatus => {
    // Check for red sensors (highest priority)
    const redSensors = sensors.filter(s => s.status === 'red');
    if (redSensors.length > 0) {
      return {
        overallStatus: 'red',
        priority: 'critical',
        sensors
      };
    }
    
    // Check for yellow sensors (medium priority)
    const yellowSensors = sensors.filter(s => s.status === 'yellow');
    if (yellowSensors.length > 0) {
      return {
        overallStatus: 'yellow',
        priority: 'warning',
        sensors
      };
    }
    
    // All sensors are green (lowest priority)
    return {
      overallStatus: 'green',
      priority: 'normal',
      sensors
    };
  };

  // Initialize and update sensor readings
  useEffect(() => {
    const updateReadings = () => {
      const sensors = generateSensorReadings();
      const status = determineSiloStatus(sensors);
      setSiloStatus(status);
    };

    updateReadings();
    const interval = setInterval(updateReadings, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [siloNumber]);

  // Get status icon based on priority
  const getStatusIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  // Get status color classes
  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'red':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'yellow':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default:
        return 'bg-green-100 border-green-300 text-green-800';
    }
  };

  // Get sensor color classes
  const getSensorClasses = (status: string) => {
    switch (status) {
      case 'red':
        return 'bg-red-500 text-white';
      case 'yellow':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-green-500 text-white';
    }
  };

  if (!siloStatus) {
    return (
      <div className={`p-4 border rounded-lg ${className}`}>
        <div className="animate-pulse">Loading silo data...</div>
      </div>
    );
  }

  return (
    <div className={`silo-monitoring-system p-6 border-2 rounded-lg ${getStatusClasses(siloStatus.overallStatus)} ${className}`}>
      {/* Silo Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Thermometer className="w-6 h-6" />
          <h3 className="text-lg font-bold">Silo {siloNumber}</h3>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(siloStatus.priority)}
          <span className="font-semibold capitalize">
            {siloStatus.priority} Status
          </span>
        </div>
      </div>

      {/* Overall Status Summary */}
      <div className="mb-4 p-3 rounded-lg bg-white bg-opacity-50">
        <div className="text-sm font-medium mb-2">Overall Status Determination:</div>
        <div className="text-xs space-y-1">
          <div>• Red sensors: {siloStatus.sensors.filter(s => s.status === 'red').length}/8 
            {siloStatus.sensors.filter(s => s.status === 'red').length > 0 && ' → CRITICAL (Highest Priority)'}
          </div>
          <div>• Yellow sensors: {siloStatus.sensors.filter(s => s.status === 'yellow').length}/8
            {siloStatus.sensors.filter(s => s.status === 'yellow').length > 0 && siloStatus.sensors.filter(s => s.status === 'red').length === 0 && ' → WARNING (Medium Priority)'}
          </div>
          <div>• Green sensors: {siloStatus.sensors.filter(s => s.status === 'green').length}/8
            {siloStatus.sensors.filter(s => s.status === 'green').length === 8 && ' → NORMAL (Lowest Priority)'}
          </div>
        </div>
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {siloStatus.sensors.map((sensor) => (
          <div
            key={sensor.id}
            className={`p-2 rounded text-center text-sm font-medium ${getSensorClasses(sensor.status)}`}
            title={`${sensor.id}: ${sensor.value}°C (${sensor.status.toUpperCase()})`}
          >
            <div className="font-bold">{sensor.id}</div>
            <div className="text-xs">{sensor.value}°C</div>
          </div>
        ))}
      </div>

      {/* Color Coding Legend */}
      <div className="text-xs space-y-1 bg-white bg-opacity-30 p-2 rounded">
        <div className="font-medium mb-1">Sensor Color Coding:</div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Green: 20.0-34.99°C</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Yellow: 35.0-39.99°C</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Red: 40.0°C+</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiloMonitoringSystem;
