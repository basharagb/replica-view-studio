import React, { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TEMPERATURE_THRESHOLDS } from '../services/siloData';
import { getAlarmedSilos } from '../services/reportService';

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
  const [alertSilos, setAlertSilos] = useState<AlertSiloStatus[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate alert silo data (simulated)
  const generateAlertSilos = (): AlertSiloStatus[] => {
    const alarmedSiloData = getAlarmedSilos();
    const alarmedSiloNumbers = alarmedSiloData.map(silo => silo.number);
    const alertSilos: AlertSiloStatus[] = [];

    // Generate random alert silos (5-10 silos with alerts)
    const numAlertSilos = Math.floor(Math.random() * 6) + 5; // 5-10 silos
    
    for (let i = 0; i < numAlertSilos; i++) {
      const randomIndex = Math.floor(Math.random() * alarmedSiloNumbers.length);
      const siloNumber = alarmedSiloNumbers[randomIndex];
      
      // Generate sensor readings with at least one alert
      const sensors: SensorReading[] = [];
      let hasAlert = false;
      let maxTemp = 0;
      let alertCount = 0;
      
      for (let j = 1; j <= 8; j++) {
        let value: number;
        
        // Ensure at least one sensor has an alert
        if (!hasAlert && j === 8) {
          // Force an alert on the last sensor if none yet
          value = Math.random() > 0.5 ? 
            Math.round((Math.random() * 5 + 35) * 10) / 10 : // Yellow
            Math.round((Math.random() * 10 + 40) * 10) / 10; // Red
        } else {
          // Random temperature with bias towards alerts
          const alertChance = Math.random();
          if (alertChance > 0.6) {
            // 40% chance of alert
            value = alertChance > 0.8 ? 
              Math.round((Math.random() * 10 + 40) * 10) / 10 : // Red
              Math.round((Math.random() * 5 + 35) * 10) / 10;   // Yellow
          } else {
            // Normal reading
            value = Math.round((Math.random() * 15 + 20) * 10) / 10;
          }
        }

        let status: 'yellow' | 'red';
        if (value >= TEMPERATURE_THRESHOLDS.RED_MIN) {
          status = 'red';
          hasAlert = true;
          alertCount++;
        } else if (value >= TEMPERATURE_THRESHOLDS.YELLOW_MIN) {
          status = 'yellow';
          hasAlert = true;
          alertCount++;
        } else {
          // Convert to yellow for display since we only show alert silos
          status = 'yellow';
        }

        maxTemp = Math.max(maxTemp, value);
        
        sensors.push({
          id: `sensor-${j}`,
          value,
          status
        });
      }

      // Determine overall status
      const hasRedSensor = sensors.some(s => s.status === 'red');
      const overallStatus = hasRedSensor ? 'red' : 'yellow';
      const priority = hasRedSensor ? 'critical' : 'warning';

      alertSilos.push({
        siloNumber,
        overallStatus,
        priority,
        sensors,
        maxTemp,
        alertCount
      });
    }

    // Sort by priority (critical first) then by max temperature
    return alertSilos.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority === 'critical' ? -1 : 1;
      }
      return b.maxTemp - a.maxTemp;
    });
  };

  useEffect(() => {
    const updateAlertSilos = () => {
      setLoading(true);
      setTimeout(() => {
        setAlertSilos(generateAlertSilos());
        setLoading(false);
      }, 500);
    };

    updateAlertSilos();
    const interval = setInterval(updateAlertSilos, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="alert-silo-monitoring p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <AlertTriangle className="w-8 h-8 text-orange-500" />
          Alert Silo Monitoring
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Real-time monitoring of silos with temperature alerts. Only showing silos that require attention.
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
                <p className="text-sm text-blue-600">Total Alert Silos</p>
                <p className="text-2xl font-bold text-blue-700">{alertSilos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Silos Grid */}
      {alertSilos.length === 0 ? (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-8 text-center">
            <div className="text-green-600">
              <TrendingUp className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">All Silos Normal</h3>
              <p>No temperature alerts detected. All silos are operating within normal parameters.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {alertSilos.map((silo) => (
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
