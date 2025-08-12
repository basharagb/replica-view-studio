import { useEffect, useState } from 'react';
import { X, Cable, Thermometer } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface CableData {
  cable_number: number;
  sensors: {
    level: number;
    temperature: number;
    color: string;
  }[];
}

interface SiloMaintenanceData {
  silo_number: number;
  silo_group: string;
  cable_count: number;
  cables: CableData[];
  overall_color: string;
}

interface MaintenanceCablePopupProps {
  siloNumber: number;
  onClose: () => void;
}

export const MaintenanceCablePopup = ({ siloNumber, onClose }: MaintenanceCablePopupProps) => {
  const [siloData, setSiloData] = useState<SiloMaintenanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSiloMaintenanceData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // API endpoint for maintenance data
        const response = await fetch(
          `http://192.168.1.14:5000/readings/latest/by-silo-number?silo_number=${siloNumber}&start=2025-07-16T00:00`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(15000), // 15 second timeout
          }
        );

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        
        // Transform API data to our expected format
        if (data && data.length > 0) {
          const apiSilo = data[0];
          const transformedData: SiloMaintenanceData = {
            silo_number: apiSilo.silo_number,
            silo_group: apiSilo.silo_group,
            cable_count: apiSilo.cable_count || 1,
            overall_color: apiSilo.color || '#22c55e',
            cables: []
          };

          // Process cables based on cable_count
          if (apiSilo.cable_count === 2) {
            // Circular silo - 2 cables with 8 sensors each
            for (let cableNum = 0; cableNum < 2; cableNum++) {
              const cable: CableData = {
                cable_number: cableNum,
                sensors: []
              };

              for (let level = 0; level < 8; level++) {
                const tempKey = `level_${level}_cable_${cableNum}`;
                const colorKey = `color_${level}_cable_${cableNum}`;
                
                cable.sensors.push({
                  level: level,
                  temperature: apiSilo[tempKey] || 25.0,
                  color: apiSilo[colorKey] || '#22c55e'
                });
              }
              
              transformedData.cables.push(cable);
            }
          } else {
            // Square silo - 1 cable with 8 sensors
            const cable: CableData = {
              cable_number: 0,
              sensors: []
            };

            for (let level = 0; level < 8; level++) {
              const tempKey = `level_${level}`;
              const colorKey = `color_${level}`;
              
              cable.sensors.push({
                level: level,
                temperature: apiSilo[tempKey] || 25.0,
                color: apiSilo[colorKey] || '#22c55e'
              });
            }
            
            transformedData.cables.push(cable);
          }

          setSiloData(transformedData);
        } else {
          throw new Error('No data received from API');
        }
      } catch (err) {
        console.error('Failed to fetch maintenance data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        
        // Fallback to mock data for development
        setSiloData(generateMockSiloData(siloNumber));
      } finally {
        setLoading(false);
      }
    };

    fetchSiloMaintenanceData();
  }, [siloNumber]);

  const generateMockSiloData = (siloNum: number): SiloMaintenanceData => {
    const isCircular = siloNum <= 100; // Assume silos 1-100 are circular, 101+ are square
    const cableCount = isCircular ? 2 : 1;
    
    const cables: CableData[] = [];
    
    for (let cableNum = 0; cableNum < cableCount; cableNum++) {
      const cable: CableData = {
        cable_number: cableNum,
        sensors: []
      };

      for (let level = 0; level < 8; level++) {
        const temp = 20 + Math.random() * 25; // Random temp between 20-45°C
        let color = '#22c55e'; // Green
        
        if (temp >= 40) color = '#ef4444'; // Red
        else if (temp >= 30) color = '#eab308'; // Yellow
        
        cable.sensors.push({
          level: level,
          temperature: parseFloat(temp.toFixed(1)),
          color: color
        });
      }
      
      cables.push(cable);
    }

    return {
      silo_number: siloNum,
      silo_group: `Group ${Math.ceil(siloNum / 25)}`,
      cable_count: cableCount,
      cables: cables,
      overall_color: '#22c55e'
    };
  };

  const getColorName = (color: string): string => {
    switch (color.toLowerCase()) {
      case '#22c55e':
      case '#16a34a':
      case 'green':
        return 'Normal';
      case '#eab308':
      case '#ca8a04':
      case 'yellow':
        return 'Warning';
      case '#ef4444':
      case '#dc2626':
      case 'red':
        return 'Critical';
      default:
        return 'Unknown';
    }
  };

  const getStatusBadgeVariant = (color: string) => {
    switch (color.toLowerCase()) {
      case '#22c55e':
      case '#16a34a':
      case 'green':
        return 'default';
      case '#eab308':
      case '#ca8a04':
      case 'yellow':
        return 'secondary';
      case '#ef4444':
      case '#dc2626':
      case 'red':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Cable className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Silo {siloNumber} - Cable Status
              </h2>
              {siloData && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {siloData.silo_group} • {siloData.cable_count} Cable{siloData.cable_count > 1 ? 's' : ''} • {siloData.cable_count * 8} Sensors
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading cable data...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-red-800 dark:text-red-200">
                <strong>Error:</strong> {error}
              </p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                Showing mock data for demonstration.
              </p>
            </div>
          )}

          {siloData && (
            <div className="space-y-6">
              {/* Overall Status */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Overall Silo Status
                  </h3>
                  <Badge variant={getStatusBadgeVariant(siloData.overall_color)}>
                    {getColorName(siloData.overall_color)}
                  </Badge>
                </div>
              </div>

              {/* Cables */}
              {siloData.cables.map((cable) => (
                <div key={cable.cable_number} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Cable className="h-5 w-5" />
                    Cable {cable.cable_number} 
                    <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                      ({cable.sensors.length} sensors)
                    </span>
                  </h4>

                  {/* Sensors Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {cable.sensors.map((sensor) => (
                      <div
                        key={sensor.level}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            S{sensor.level + 1}
                          </span>
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: sensor.color }}
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <Thermometer className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-mono text-gray-900 dark:text-white">
                            {sensor.temperature}°C
                          </span>
                        </div>
                        <div className="mt-1">
                          <Badge 
                            variant={getStatusBadgeVariant(sensor.color)}
                            className="text-xs"
                          >
                            {getColorName(sensor.color)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
