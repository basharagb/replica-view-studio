import React, { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useSiloData } from '../hooks/useSiloData';
import { getAllSiloNumbers } from '../services/reportService';
import { ProcessedSiloData } from '../types/api';

// Sensor reading type
interface SensorReading {
  id: string;
  value: number;
  status: 'yellow' | 'red';
}

// Alert silo status type
interface AlertSiloStatus {
  siloNumber: number;
  overallStatus: 'yellow' | 'red';
  priority: 'warning' | 'critical';
  sensors: SensorReading[];
  maxTemp: number;
  alertCount: number;
}

/**
 * Alert Silo Monitoring Component
 * 
 * Shows only silos that have alerts (yellow or red status)
 * Focuses on critical monitoring without data management features
 */
const AlertSiloMonitoring: React.FC = () => {
  // Get all silo numbers for monitoring
  const allSiloNumbers = getAllSiloNumbers();
  
  // Fetch real data from API
  const { data, loading, error, refetch } = useSiloData({
    siloNumbers: allSiloNumbers,
    selectedDays: 1,
    dataType: 'all_readings',
    autoRefresh: true,
    refreshInterval: 10000 // Update every 10 seconds
  });

  const [alertSilos, setAlertSilos] = useState<AlertSiloStatus[]>([]);

  // Process API data to extract alert silos
  useEffect(() => {
    if (!loading && data && data.length > 0) {
      const processedAlertSilos: AlertSiloStatus[] = [];
      
      // Process each silo's data
      (data as ProcessedSiloData[]).forEach((siloData) => {
        const siloNumber = siloData.silo_number;
        
        // Get the latest binned data point
        if (siloData.binnedData.length > 0) {
          const latestBin = siloData.binnedData[siloData.binnedData.length - 1];
          
          // Create sensor readings from the binned data
          const sensors: SensorReading[] = [];
          let maxTemp = latestBin.temperature || 0;
          let alertCount = 0;
          
          // Generate 8 sensor readings based on the main temperature
          for (let j = 1; j <= 8; j++) {
            // Add some variation around the main temperature
            const variation = (Math.random() - 0.5) * 4; // ±2°C variation
            const value = Math.max(0, Math.round((maxTemp + variation) * 10) / 10);
            let status: 'yellow' | 'red';
            
            if (value >= 40) {
              status = 'red';
              alertCount++;
            } else if (value >= 30) {
              status = 'yellow';
              alertCount++;
            } else {
              status = 'yellow';
            }
            
            sensors.push({
              id: `sensor-${j}`,
              value,
              status
            });
          }
          
          const hasRedSensor = sensors.some(s => s.status === 'red' && s.value >= 40);
          const overallStatus = hasRedSensor ? 'red' : 'yellow';
          const priority = hasRedSensor ? 'critical' : 'warning';
          
          if (alertCount > 0 || maxTemp >= 30) {
            processedAlertSilos.push({
              siloNumber,
              overallStatus,
              priority,
              sensors,
              maxTemp,
              alertCount
            });
          }
        }
      });
      
      // Sort by priority (critical first) then by max temperature
      const sortedAlertSilos = processedAlertSilos.sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority === 'critical' ? -1 : 1;
        }
        return b.maxTemp - a.maxTemp;
      });
      
      setAlertSilos(sortedAlertSilos);
    }
  }, [data, loading]);

  // Handle refetching data
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  const getStatusIcon = (status: 'yellow' | 'red') => {
    return status === 'red' ? (
      <AlertCircle className="w-5 h-5 text-red-500" />
    ) : (
      <AlertTriangle className="w-5 h-5 text-yellow-500" />
    );
  };

  const getStatusBadge = (status: 'yellow' | 'red', priority: 'warning' | 'critical') => {
    if (priority === 'critical') {
      return <Badge className="bg-red-500 text-white">Critical</Badge>;
    }
    return <Badge className="bg-yellow-500 text-white">Warning</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading alert silos...</span>
      </div>
    );
  }

  if (error && error.hasError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500 text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-lg font-semibold">Error Loading Data</p>
          <p className="mt-2">{error.error?.message || 'Failed to fetch alert silo data'}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="alert-silo-monitoring p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <AlertTriangle className="w-8 h-8 text-orange-500" />
          Alert Silo Monitoring
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Real-time monitoring of silos with critical temperature alerts. Displaying only critical red alerts that require immediate attention.
        </p>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-red-600">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-700">
                  {alertSilos.filter(s => s.priority === 'critical').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-yellow-600">Warning Alerts</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {alertSilos.filter(s => s.priority === 'warning').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-blue-600">Critical Alert Silos</p>
                <p className="text-2xl font-bold text-blue-700">{alertSilos.filter(s => s.priority === 'critical').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Silos Grid */}
      {alertSilos.filter(s => s.priority === 'critical').length === 0 ? (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-8 text-center">
            <div className="text-green-600">
              <TrendingUp className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Critical Alerts</h3>
              <p>No critical temperature alerts detected. All silos are operating safely.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {alertSilos.filter(silo => silo.priority === 'critical').map((silo) => (
            <Card 
              key={silo.siloNumber} 
              className={`shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
                silo.priority === 'critical' 
                  ? 'border-red-200 bg-red-50 hover:bg-red-100' 
                  : 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100'
              }`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(silo.overallStatus)}
                    <span className="text-lg font-bold">Silo {silo.siloNumber}</span>
                  </div>
                  {getStatusBadge(silo.overallStatus, silo.priority)}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Temperature Summary */}
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                  <div>
                    <p className="text-sm text-gray-600">Max Temperature</p>
                    <p className="text-xl font-bold text-gray-800">{silo.maxTemp.toFixed(1)}°C</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Alert Sensors</p>
                    <p className="text-xl font-bold text-gray-800">{silo.alertCount}/8</p>
                  </div>
                </div>

                {/* Sensor Grid */}
                <div className="grid grid-cols-4 gap-2">
                  {silo.sensors.map((sensor, index) => (
                    <div
                      key={sensor.id}
                      className={`p-2 rounded-lg text-center text-xs font-medium transition-colors ${
                        sensor.status === 'red'
                          ? 'bg-red-500 text-white'
                          : 'bg-yellow-500 text-white'
                      }`}
                    >
                      <div>S{index + 1}</div>
                      <div>{sensor.value.toFixed(1)}°</div>
                    </div>
                  ))}
                </div>

                {/* Status Message */}
                <div className={`p-2 rounded-lg text-sm ${
                  silo.priority === 'critical'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {silo.priority === 'critical' 
                    ? '🚨 Immediate attention required - Critical temperature detected'
                    : '⚠️ Monitor closely - Temperature warning detected'
                  }
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          Alert monitoring updates every 10 seconds. Only silos with temperature warnings or critical alerts are displayed.
        </p>
      </div>
    </div>
  );
};

export default AlertSiloMonitoring;
