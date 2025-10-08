import React, { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, TrendingUp, CheckCircle, Clock, Calendar, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { fetchActiveAlerts, ProcessedAlert, formatAlertTimestamp, formatAlertDuration, clearAlertsCache } from '../services/alertsApiService';

// Sensor reading type
interface SensorReading {
  id: string;
  value: number;
  status: 'ok' | 'yellow' | 'red';
}

// Alert silo status type
interface AlertSiloStatus {
  siloNumber: number;
  overallStatus: 'ok' | 'yellow' | 'red';
  priority: 'normal' | 'warning' | 'critical';
  sensors: SensorReading[];
  maxTemp: number;
  alertCount: number;
  siloGroup?: string;
  activeSince?: Date;
  timestamp?: Date;
  duration?: string;
  siloColor?: string;
  alertType?: 'critical' | 'warning' | 'disconnect';
  affectedLevels?: number[];
}

/** Robust color -> status mapping */
const colorToStatus = (color?: string): 'ok' | 'yellow' | 'red' => {
  if (!color) return 'ok';
  const c = color.trim().toLowerCase();

  if (c === 'red' || c === '#d14141') return 'red';
  if (c === 'yellow' || c === '#c7c150') return 'yellow';
  if (c === 'green' || c === '#46d446') return 'ok';

  const hexMatch = c.match(/^#?([0-9a-f]{6})$/);
  if (hexMatch) {
    const hex = hexMatch[1];
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    if (r > g + 40 && r > b + 40) return 'red';
    if (g > r + 40 && g > b + 40) return 'ok';
    if (r > 140 && g > 140 && b < 120) return 'yellow';

    return 'ok';
  }

  return 'ok';
};

// Helper to determine if color is dark (to pick white or black text)
const isColorDark = (color: string): boolean => {
  if (!color) return false;
  // Normalize hex format
  let c = color.trim().toLowerCase();
  if (!c.startsWith('#')) c = '#' + c;
  // Support only 6-digit hex colors here
  const hexMatch = c.match(/^#([0-9a-f]{6})$/);
  if (!hexMatch) return false;

  const hex = hexMatch[1];
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5; // dark if luminance below 0.5
};

const AlertSiloMonitoring: React.FC = () => {
  const [alertSilos, setAlertSilos] = useState<AlertSiloStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlertSilos = async () => {
    setLoading(true);
    try {
      console.log('🚨 [ALERT SILO MONITORING] Fetching alerts...');
      const result = await fetchActiveAlerts();
      
      console.log('🚨 [ALERT SILO MONITORING] Fetch result:', {
        alertsCount: result.alerts.length,
        isLoading: result.isLoading,
        error: result.error
      });

      if (result.error) {
        throw new Error(result.error);
      }

      const alerts = result.alerts;
      const mapped: AlertSiloStatus[] = alerts.map((alert: ProcessedAlert) => {
        const sensors: SensorReading[] = [];
        let alertCount = 0;

        // Convert sensor data to SensorReading format
        for (let i = 0; i <= 7; i++) {
          const value = alert.sensors[i] || 0;
          const color = alert.sensorColors[i];
          const status = colorToStatus(color);

          if (status === 'red' || status === 'yellow') alertCount++;

          sensors.push({
            id: `sensor-${i + 1}`,
            value,
            status,
          });
        }

        const overallStatus = colorToStatus(alert.siloColor);
        let priority: 'normal' | 'warning' | 'critical' = 'normal';
        if (alert.alertType === 'critical' || overallStatus === 'red') priority = 'critical';
        else if (alert.alertType === 'warning' || alert.alertType === 'disconnect' || overallStatus === 'yellow' || alertCount > 0) priority = 'warning';

        return {
          siloNumber: alert.siloNumber,
          overallStatus,
          priority,
          sensors,
          maxTemp: alert.maxTemp,
          alertCount,
          siloGroup: alert.siloGroup,
          activeSince: alert.activeSince,
          timestamp: alert.timestamp,
          duration: alert.duration,
          siloColor: alert.siloColor || '#ffffff',
          alertType: alert.alertType,
          affectedLevels: alert.affectedLevels,
        } as AlertSiloStatus;
      });

      // Filter out normal priority alerts (only show warnings and critical)
      const filtered = mapped.filter(s => s.priority !== 'normal');

      // Sort by priority and then by max temperature
      filtered.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority === 'critical' ? -1 : 1;
        return b.maxTemp - a.maxTemp;
      });

      console.log('🚨 [ALERT SILO MONITORING] Processed alerts:', {
        totalMapped: mapped.length,
        filtered: filtered.length,
        priorityCounts: filtered.reduce((acc, silo) => {
          acc[silo.priority] = (acc[silo.priority] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });

      setAlertSilos(filtered);
    } catch (err) {
      console.error('🚨 [ALERT SILO MONITORING] Failed to fetch alert silos:', err);
      setAlertSilos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Clear cache and fetch fresh data when component mounts (user navigates to Alert Monitoring)
    console.log('🚨 [ALERT SILO MONITORING] Component mounted - clearing cache and fetching fresh data');
    clearAlertsCache();
    fetchAlertSilos();
    
    // Set up 1-hour interval for auto-refresh when page is left open
    const interval = setInterval(() => {
      console.log('🚨 [ALERT SILO MONITORING] 1-hour auto-refresh triggered');
      clearAlertsCache(); // Clear cache before auto-refresh too
      fetchAlertSilos();
    }, 3600000); // 1 hour (3600 seconds)
    
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    if (refreshing) return; // Prevent multiple simultaneous refreshes
    
    setRefreshing(true);
    console.log('🚨 [ALERT SILO MONITORING] Manual refresh triggered - clearing cache');
    clearAlertsCache();
    
    try {
      await fetchAlertSilos();
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status: 'ok' | 'yellow' | 'red') => {
    if (status === 'red') return <AlertCircle className="w-5 h-5 text-red-500" />;
    if (status === 'yellow') return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  const getStatusBadge = (priority: 'normal' | 'warning' | 'critical') => {
    if (priority === 'critical') return <Badge className="bg-red-500 text-white">Critical</Badge>;
    if (priority === 'warning') return <Badge className="bg-yellow-500 text-white">Warning</Badge>;
    return <Badge className="bg-green-500 text-white">Normal</Badge>;
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
        <div className="flex items-center justify-center gap-4 mb-2">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
            Alert Silo Monitoring
          </h1>
          <button
            onClick={handleManualRefresh}
            disabled={loading || refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200"
            title="Refresh alerts data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Real-time monitoring of silos with critical temperature alerts. Displaying only silos with warnings or critical alerts.
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

        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Disconnect Alerts</p>
                <p className="text-2xl font-bold text-gray-700">
                  {alertSilos.filter(s => s.alertType === 'disconnect').length}
                </p>
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
              <h3 className="text-lg font-semibold mb-2">No Alerts</h3>
              <p>No temperature alerts detected. All silos are operating safely.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {alertSilos.map((silo) => {
            const bgColor = silo.siloColor || '#ffffff';
            const darkText = !isColorDark(bgColor);
            const textColor = darkText ? 'text-black' : 'text-white';
            // Border: slightly darker than bg or fallback to gray
            const borderColor = bgColor;

            return (
              <Card
                key={silo.siloNumber}
                style={{ backgroundColor: bgColor, borderColor: borderColor }}
                className={`shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${textColor}`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(silo.overallStatus)}
                      <span className="text-lg font-bold">Silo {silo.siloNumber}</span>
                    </div>
                    {getStatusBadge(silo.priority)}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Temperature Summary */}
                  <div className={`flex justify-between items-center p-3 rounded-lg border ${textColor}`} style={{ borderColor: borderColor, backgroundColor: darkText ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.2)' }}>
                    <div>
                      <p className="text-sm">Max Temperature</p>
                      <p className="text-xl font-bold">{silo.maxTemp.toFixed(1)}°C</p>
                    </div>
                    <div>
                      <p className="text-sm">Alert Sensors</p>
                      <p className="text-xl font-bold">{silo.alertCount}/8</p>
                    </div>
                  </div>

                  {/* Sensor Grid */}
                  <div className="grid grid-cols-4 gap-2">
                    {silo.sensors.map((sensor, index) => {
                      // For sensor boxes, keep colors consistent but override text color for readability
                      let sensorBg = '';
                      if (sensor.status === 'red') sensorBg = 'bg-red-500';
                      else if (sensor.status === 'yellow') sensorBg = 'bg-yellow-500';
                      else sensorBg = 'bg-green-500';

                      return (
                        <div
                          key={sensor.id}
                          className={`${sensorBg} p-2 rounded-lg text-center text-xs font-medium text-white transition-colors`}
                        >
                          <div>S{index + 1}</div>
                          <div>{Number(sensor.value).toFixed(1)}°</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Time and Date Information */}
                  {silo.activeSince && (
                    <div className={`p-3 rounded-lg text-sm space-y-2 ${darkText ? 'bg-white bg-opacity-70' : 'bg-black bg-opacity-20'}`}>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <div>
                          <span className="font-medium">Active Since:</span>
                          <div className="text-xs">{formatAlertTimestamp(silo.activeSince)}</div>
                        </div>
                      </div>
                      {silo.duration && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <div>
                            <span className="font-medium">Duration:</span>
                            <span className="ml-1 text-xs">{silo.duration}</span>
                          </div>
                        </div>
                      )}
                      {silo.affectedLevels && silo.affectedLevels.length > 0 && (
                        <div className="text-xs">
                          <span className="font-medium">Affected Levels:</span>
                          <span className="ml-1">{silo.affectedLevels.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Status Message */}
                  <div className={`p-2 rounded-lg text-sm ${silo.priority === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {silo.priority === 'critical'
                      ? '🚨 Immediate attention required - Critical temperature detected'
                      : '⚠️ Monitor closely - Temperature warning detected'}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Alert monitoring updates every 1 hour. Only silos with active alerts (critical, warning, or disconnect) are displayed.</p>
      </div>
    </div>
  );
};

export default AlertSiloMonitoring;
