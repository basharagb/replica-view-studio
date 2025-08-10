/**
 * System Status Bar
 * Displays overall system health and API integration status
 */

import React from 'react';
import { useSystemData } from '../providers/SystemDataProvider';
import { Wifi, WifiOff, AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

export const SystemStatusBar: React.FC = () => {
  const {
    systemHealth,
    isLoading,
    error,
    lastUpdated,
    dataSettings,
    refreshAllData,
    clearError,
    enableAPIMode,
    enableMockMode,
    toggleRealTime,
    isAPIMode,
    isRealTimeEnabled
  } = useSystemData();

  const getHealthIcon = () => {
    switch (systemHealth) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getHealthColor = () => {
    switch (systemHealth) {
      case 'healthy':
        return 'bg-green-50 border-green-200';
      case 'degraded':
        return 'bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = () => {
    if (isAPIMode()) {
      return systemHealth === 'healthy' 
        ? 'Industrial Monitoring System - Live Data Active'
        : 'Industrial Monitoring System - API Issues Detected';
    } else {
      return 'Industrial Monitoring System - Fallback Mode';
    }
  };

  return (
    <div className={`w-full p-3 border-b ${getHealthColor()}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* System Status */}
        <div className="flex items-center gap-3">
          {getHealthIcon()}
          <span className="font-medium text-sm">{getStatusText()}</span>
          
          {/* Data Source Indicator */}
          <div className="flex items-center gap-2 ml-4">
            {isAPIMode() ? (
              <div className="flex items-center gap-1 text-green-700">
                <Wifi className="w-3 h-3" />
                <span className="text-xs">Live API</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-orange-700">
                <WifiOff className="w-3 h-3" />
                <span className="text-xs">Fallback</span>
              </div>
            )}
            
            {/* Real-time Indicator */}
            {isRealTimeEnabled() && (
              <div className="flex items-center gap-1 text-blue-700">
                <Clock className="w-3 h-3" />
                <span className="text-xs">Real-time</span>
              </div>
            )}
          </div>
          
          {/* Last Updated */}
          {lastUpdated && (
            <span className="text-xs text-gray-600 ml-4">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm mr-3">
              <AlertTriangle className="w-4 h-4" />
              <span className="max-w-xs truncate">{error}</span>
              <Button variant="outline" size="sm" onClick={clearError}>
                Clear
              </Button>
            </div>
          )}
          
          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAllData}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-xs">Refresh</span>
          </Button>
          
          {/* Real-time Toggle */}
          <Button
            variant={isRealTimeEnabled() ? "default" : "outline"}
            size="sm"
            onClick={toggleRealTime}
            className="flex items-center gap-1"
          >
            <Clock className="w-3 h-3" />
            <span className="text-xs">
              {isRealTimeEnabled() ? 'Real-time ON' : 'Real-time OFF'}
            </span>
          </Button>
          
          {/* Data Source Toggle */}
          <Button
            variant={isAPIMode() ? "default" : "outline"}
            size="sm"
            onClick={isAPIMode() ? enableMockMode : enableAPIMode}
            className="flex items-center gap-1"
          >
            {isAPIMode() ? (
              <>
                <Wifi className="w-3 h-3" />
                <span className="text-xs">Live Mode</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                <span className="text-xs">Fallback Mode</span>
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* System Health Details */}
      {systemHealth !== 'healthy' && (
        <div className="max-w-7xl mx-auto mt-2 text-xs">
          {systemHealth === 'degraded' && (
            <div className="text-yellow-700">
              ⚠️ Some API endpoints may be experiencing issues. System is operating with available data.
            </div>
          )}
          {systemHealth === 'critical' && (
            <div className="text-red-700">
              🚨 API connectivity issues detected. System has switched to fallback mode.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SystemStatusBar;
