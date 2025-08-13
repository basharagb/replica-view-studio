import React, { useEffect, useState, useCallback } from 'react';
import { AlertTriangle, CheckCircle, Activity, Cable, X, Clock, Thermometer, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { fetchMaintenanceSiloData, MaintenanceSiloData, CableData, CableSensorData } from '../services/maintenanceApiService';

interface MaintenanceCablePopupProps {
  siloNumber: number;
  onClose: () => void;
}

export const MaintenanceCablePopup = ({ siloNumber, onClose }: MaintenanceCablePopupProps) => {
  const [siloData, setSiloData] = useState<MaintenanceSiloData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSiloMaintenanceData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const data = await fetchMaintenanceSiloData(siloNumber);
      setSiloData(data);
    } catch (err) {
      console.error('Failed to fetch silo maintenance data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load maintenance data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [siloNumber]);

  useEffect(() => {
    fetchSiloMaintenanceData();
  }, [fetchSiloMaintenanceData]);

  const handleRefresh = () => {
    fetchSiloMaintenanceData(true);
  };

  const getStatusIcon = (color: string) => {
    if (color === '#d14141') return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (color === '#ff9800') return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = (color: string) => {
    if (color === '#d14141') return 'Critical';
    if (color === '#ff9800') return 'Warning';
    return 'Normal';
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-lg text-gray-600 dark:text-gray-300">Loading maintenance data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-red-600 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Connection Error
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <div className="flex gap-2">
            <Button onClick={handleRefresh} variant="outline" className="flex-1">
              Try Again
            </Button>
            <Button onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mr-4">
              <Cable className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Silo {siloNumber} - Cable Testing
              </h2>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {siloData?.siloGroup} • {siloData?.cableCount === 2 ? 'Circular' : 'Square'} • {siloData?.cableCount} Cable{siloData?.cableCount !== 1 ? 's' : ''}
                </p>
                <Badge variant={siloData?.siloColor === '#d14141' ? 'destructive' : siloData?.siloColor === '#ff9800' ? 'secondary' : 'default'}>
                  {getStatusIcon(siloData?.siloColor || '#46d446')}
                  <span className="ml-1">{getStatusText(siloData?.siloColor || '#46d446')}</span>
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-1">Refresh</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* System Overview */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Thermometer className="h-5 w-5 text-gray-600 mr-2" />
                <span>System Overview</span>
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Last Updated: {siloData?.timestamp ? formatDateTime(siloData.timestamp) : 'N/A'}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold" style={{ color: siloData?.siloColor }}>
                  {siloData ? Math.max(...siloData.sensorValues).toFixed(1) : '0.0'}°C
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Max Temperature</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {siloData ? siloData.cables.reduce((total, cable) => total + cable.sensors.length, 0) : 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Sensors</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {siloData?.cables.length || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Active Cables</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unified Cable Table */}
        <Card className="overflow-hidden border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
                  <Cable className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <span className="text-lg">Cable Temperature Comparison</span>
                  <div className="text-sm text-gray-500 font-normal">
                    {siloData?.cableCount === 2 ? 'Cable 0 & Cable 1' : 'Cable 0 Only'} • Temperature Sensors (Top to Bottom)
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white">
                  <Activity className="h-3 w-3 mr-1" />
                  Active
                </Badge>
                <Badge variant="outline">
                  {siloData?.cables.reduce((total, cable) => total + cable.sensors.length, 0) || 0} Total Sensors
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Unified Sensor Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-600">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Sensor
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Cable 0
                    </th>
                    {siloData?.cableCount === 2 && (
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Cable 1
                      </th>
                    )}
                    {siloData?.cableCount === 2 && (
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Average
                      </th>
                    )}
                    <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 8 }, (_, sensorIndex) => {
                    const cable0Sensor = siloData?.cables.find(c => c.cableIndex === 0)?.sensors[sensorIndex];
                    const cable1Sensor = siloData?.cables.find(c => c.cableIndex === 1)?.sensors[sensorIndex];
                    const avgTemp = siloData?.cableCount === 2 && cable0Sensor && cable1Sensor 
                      ? (cable0Sensor.level + cable1Sensor.level) / 2 
                      : cable0Sensor?.level || 0;
                    const avgColor = siloData?.sensorColors[sensorIndex] || '#46d446';
                    
                    return (
                      <tr 
                        key={sensorIndex} 
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        {/* Sensor Label */}
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: avgColor }}></div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              S{sensorIndex + 1}
                            </span>
                          </div>
                        </td>
                        
                        {/* Cable 0 */}
                        <td className="py-4 px-4 text-center">
                          {cable0Sensor ? (
                            <div className="flex flex-col items-center">
                              <div className="bg-white dark:bg-gray-800 border-2 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow min-w-[80px]"
                                   style={{ borderColor: cable0Sensor.color }}>
                                <div 
                                  className="text-lg font-bold mb-1"
                                  style={{ color: cable0Sensor.color }}
                                >
                                  {cable0Sensor.level.toFixed(1)}°C
                                </div>
                                <div className="flex items-center justify-center">
                                  {getStatusIcon(cable0Sensor.color)}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-3 shadow-sm min-w-[80px]">
                              <span className="text-gray-400">N/A</span>
                            </div>
                          )}
                        </td>
                        
                        {/* Cable 1 (if exists) */}
                        {siloData?.cableCount === 2 && (
                          <td className="py-4 px-4 text-center">
                            {cable1Sensor ? (
                              <div className="flex flex-col items-center">
                                <div className="bg-white dark:bg-gray-800 border-2 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow min-w-[80px]"
                                     style={{ borderColor: cable1Sensor.color }}>
                                  <div 
                                    className="text-lg font-bold mb-1"
                                    style={{ color: cable1Sensor.color }}
                                  >
                                    {cable1Sensor.level.toFixed(1)}°C
                                  </div>
                                  <div className="flex items-center justify-center">
                                    {getStatusIcon(cable1Sensor.color)}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-3 shadow-sm min-w-[80px]">
                                <span className="text-gray-400">N/A</span>
                              </div>
                            )}
                          </td>
                        )}
                        
                        {/* Average (if 2 cables) */}
                        {siloData?.cableCount === 2 && (
                          <td className="py-4 px-4 text-center">
                            <div className="flex flex-col items-center">
                              <div className="bg-white dark:bg-gray-800 border-2 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow min-w-[80px]"
                                   style={{ borderColor: avgColor, backgroundColor: `${avgColor}08` }}>
                                <div 
                                  className="text-lg font-bold mb-1"
                                  style={{ color: avgColor }}
                                >
                                  {avgTemp.toFixed(1)}°C
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                  AVG
                                </div>
                              </div>
                            </div>
                          </td>
                        )}
                        
                        {/* Status */}
                        <td className="py-4 px-4 text-center">
                          <Badge 
                            variant={avgColor === '#d14141' ? 'destructive' : avgColor === '#ff9800' ? 'secondary' : 'default'}
                            className="text-xs"
                          >
                            {getStatusText(avgColor)}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Cable Statistics Summary */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Max Temp</div>
                  <div className="text-lg font-bold text-red-600">
                    {siloData ? Math.max(...siloData.sensorValues).toFixed(1) : '0.0'}°C
                  </div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg Temp</div>
                  <div className="text-lg font-bold text-blue-600">
                    {siloData ? (siloData.sensorValues.reduce((sum, val) => sum + val, 0) / siloData.sensorValues.length).toFixed(1) : '0.0'}°C
                  </div>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Min Temp</div>
                  <div className="text-lg font-bold text-green-600">
                    {siloData ? Math.min(...siloData.sensorValues).toFixed(1) : '0.0'}°C
                  </div>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Cables</div>
                  <div className="text-lg font-bold text-purple-600">
                    {siloData?.cables.length || 0}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calculated Sensor Values (S1-S8) */}
        {siloData && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Thermometer className="h-5 w-5 text-gray-600 mr-2" />
                <span>Calculated Sensor Values (S1-S8)</span>
                {siloData.cableCount === 2 && (
                  <Badge variant="outline" className="ml-2">
                    Averaged from both cables
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {siloData.sensorValues.map((value, index) => (
                  <div 
                    key={index}
                    className="text-center p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105"
                    style={{ 
                      backgroundColor: `${siloData.sensorColors[index]}15`,
                      borderColor: siloData.sensorColors[index]
                    }}
                  >
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                      S{index + 1}
                    </div>
                    <div 
                      className="text-lg font-bold"
                      style={{ color: siloData.sensorColors[index] }}
                    >
                      {value.toFixed(1)}°C
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex justify-between items-center">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Activity className="h-4 w-4 mr-2" />
              <span>Real-time cable testing data from API: 192.168.1.14:5000</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? 'Refreshing...' : 'Refresh Data'}
              </Button>
              <Button onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
