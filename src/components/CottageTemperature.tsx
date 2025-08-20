/**
 * Cottage Temperature Component
 * Displays inside and outside temperature readings from cottage environment sensors
 * slave_id 21 = Inside temperature
 * slave_id 22 = Outside temperature
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Thermometer, Home, TreePine, Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { useCottageTemperature } from '../hooks/useCottageTemperature';
import { cn } from '../lib/utils';

interface CottageTemperatureProps {
  className?: string;
  showRefreshButton?: boolean;
  compact?: boolean;
}

const CottageTemperature: React.FC<CottageTemperatureProps> = ({
  className,
  showRefreshButton = true,
  compact = false
}) => {
  const { data, isLoading, error, isConnected, refreshData } = useCottageTemperature();

  // Format temperature display
  const formatTemperature = (temp: number, status: 'normal' | 'warning' | 'error' | 'disconnected'): string => {
    if (status === 'disconnected') return 'Disconnected';
    if (temp === -127.0) return 'Error';
    return `${temp.toFixed(1)}°C`;
  };

  // Get temperature color based on value and status
  const getTemperatureColor = (temp: number, status: 'normal' | 'warning' | 'error' | 'disconnected'): string => {
    if (status === 'disconnected') return 'text-gray-500';
    if (status === 'error') return 'text-red-500';
    if (status === 'warning') return 'text-yellow-500';
    if (temp < 10) return 'text-blue-500';
    if (temp > 30) return 'text-orange-500';
    return 'text-green-500';
  };

  // Get status badge variant
  const getStatusVariant = (status: 'normal' | 'warning' | 'error' | 'disconnected'): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'disconnected': return 'outline';
      case 'error': return 'destructive';
      case 'warning': return 'outline';
      default: return 'secondary';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return 'Invalid time';
    }
  };

  if (compact) {
    return (
      <div className={cn("flex gap-4", className)}>
        {/* Inside Temperature - Compact */}
        <Card className="flex-1 min-w-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Inside</span>
              </div>
              <div className="text-right">
                <div className={cn("text-lg font-bold", data.inside ? getTemperatureColor(data.inside.temperature, data.inside.status) : 'text-gray-400')}>
                  {data.inside ? formatTemperature(data.inside.temperature, data.inside.status) : '--°C'}
                </div>
                {data.inside && (
                  <Badge variant={getStatusVariant(data.inside.status)} className="text-xs">
                    {data.inside.status}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Outside Temperature - Compact */}
        <Card className="flex-1 min-w-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TreePine className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Outside</span>
              </div>
              <div className="text-right">
                <div className={cn("text-lg font-bold", data.outside ? getTemperatureColor(data.outside.temperature, data.outside.status) : 'text-gray-400')}>
                  {data.outside ? formatTemperature(data.outside.temperature, data.outside.status) : '--°C'}
                </div>
                {data.outside && (
                  <Badge variant={getStatusVariant(data.outside.status)} className="text-xs">
                    {data.outside.status}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Cottage Temperature</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {/* Connection Status */}
            <div className="flex items-center gap-1">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className={cn("text-xs", isConnected ? 'text-green-600' : 'text-red-600')}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            {/* Refresh Button */}
            {showRefreshButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={isLoading}
                className="h-8 px-2"
              >
                <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
              </Button>
            )}
          </div>
        </div>
        
        {/* Last Updated */}
        {data.lastUpdated && (
          <p className="text-xs text-muted-foreground">
            Last updated: {data.lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !data.inside && !data.outside && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
            <span className="ml-2 text-sm text-muted-foreground">Loading temperature data...</span>
          </div>
        )}

        {/* Temperature Readings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Inside Temperature */}
          <Card className="border-2 border-blue-100 bg-blue-50/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Inside Temperature</span>
                </div>
                {data.inside && (
                  <Badge variant={getStatusVariant(data.inside.status)}>
                    {data.inside.status}
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                <div className={cn("text-3xl font-bold", data.inside ? getTemperatureColor(data.inside.temperature, data.inside.status) : 'text-gray-400')}>
                  {data.inside ? formatTemperature(data.inside.temperature, data.inside.status) : '--°C'}
                </div>
                
                {data.inside && (
                  <div className="text-xs text-muted-foreground">
                    <div>Sensor ID: 21</div>
                    <div>Updated: {formatTimestamp(data.inside.timestamp)}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Outside Temperature */}
          <Card className="border-2 border-green-100 bg-green-50/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TreePine className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">Outside Temperature</span>
                </div>
                {data.outside && (
                  <Badge variant={getStatusVariant(data.outside.status)}>
                    {data.outside.status}
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                <div className={cn("text-3xl font-bold", data.outside ? getTemperatureColor(data.outside.temperature, data.outside.status) : 'text-gray-400')}>
                  {data.outside ? formatTemperature(data.outside.temperature, data.outside.status) : '--°C'}
                </div>
                
                {data.outside && (
                  <div className="text-xs text-muted-foreground">
                    <div>Sensor ID: 22</div>
                    <div>Updated: {formatTimestamp(data.outside.timestamp)}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Temperature Difference */}
        {data.inside && data.outside && data.inside.status !== 'error' && data.outside.status !== 'error' && (
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Temperature Difference</span>
                <span className="text-sm font-bold text-gray-900">
                  {Math.abs(data.inside.temperature - data.outside.temperature).toFixed(1)}°C
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Inside is {data.inside.temperature > data.outside.temperature ? 'warmer' : 'cooler'} than outside
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default CottageTemperature;
