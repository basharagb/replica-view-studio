import React from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Thermometer } from 'lucide-react';
import { 
  getTemperatureColor, 
  getAlertLevel, 
  getTemperatureTrend,
  TEMPERATURE_THRESHOLDS 
} from '../services/siloData';
import { AlertLevel, TemperatureTrend } from '../types/silo';

interface EnhancedTemperatureDisplayProps {
  temperature: number;
  previousTemperature?: number;
  siloNumber: number;
  className?: string;
  showTrend?: boolean;
  showAlerts?: boolean;
}

const EnhancedTemperatureDisplay: React.FC<EnhancedTemperatureDisplayProps> = ({
  temperature,
  previousTemperature,
  siloNumber,
  className = '',
  showTrend = true,
  showAlerts = true
}) => {
  const colorClass = getTemperatureColor(temperature);
  const alertLevel = getAlertLevel(temperature);
  const trend = getTemperatureTrend(temperature, previousTemperature);

  const getTrendIcon = (trend: TemperatureTrend) => {
    switch (trend) {
      case 'rising':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'falling':
        return <TrendingDown className="w-4 h-4 text-blue-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAlertIcon = (level: AlertLevel) => {
    switch (level) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getTemperatureStatus = (temp: number) => {
    if (temp < TEMPERATURE_THRESHOLDS.NORMAL_MAX) return 'Normal';
    if (temp <= TEMPERATURE_THRESHOLDS.WARNING_MAX) return 'Elevated';
    return 'Critical';
  };

  const getStatusColor = (temp: number) => {
    if (temp < TEMPERATURE_THRESHOLDS.NORMAL_MAX) return 'text-green-600';
    if (temp <= TEMPERATURE_THRESHOLDS.WARNING_MAX) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`enhanced-temp-display ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Silo {siloNumber}</span>
        </div>
        {showAlerts && getAlertIcon(alertLevel)}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className={`text-2xl font-bold temp-${colorClass}`}>
            {temperature.toFixed(1)}°C
          </span>
          <span className={`text-xs font-medium ${getStatusColor(temperature)}`}>
            {getTemperatureStatus(temperature)}
          </span>
        </div>
        
        {showTrend && (
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1">
              {getTrendIcon(trend)}
              <span className="text-xs text-gray-500 capitalize">{trend}</span>
            </div>
            {previousTemperature && (
              <span className="text-xs text-gray-400">
                Δ {(temperature - previousTemperature).toFixed(1)}°C
              </span>
            )}
          </div>
        )}
      </div>

      {/* Temperature range indicator */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>20°C</span>
          <span>30°C</span>
          <span>40°C</span>
          <span>50°C</span>
        </div>
        <div className="relative h-2 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-full">
          <div 
            className="absolute top-0 w-1 h-2 bg-gray-800 rounded-full transform -translate-x-1/2"
            style={{ 
              left: `${Math.min(Math.max((temperature - 20) / 30 * 100, 0), 100)}%` 
            }}
          />
        </div>
      </div>

      {/* Threshold indicators */}
      <div className="mt-2 flex justify-between text-xs">
        <span className="text-green-600">Normal &lt;30°C</span>
        <span className="text-yellow-600">Warning 30-40°C</span>
        <span className="text-red-600">Critical &gt;40°C</span>
      </div>
    </div>
  );
};

export default EnhancedTemperatureDisplay;
