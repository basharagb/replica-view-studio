import React, { useState, useEffect } from 'react';
import { AlertTriangle, Bell, X, Volume2, VolumeX, Clock, Calendar, Loader2, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { fetchActiveAlerts, ProcessedAlert, formatAlertTimestamp, formatAlertDuration, refreshAlerts, clearAlertsCache } from '../services/alertsApiService';

interface Alert extends ProcessedAlert {
  acknowledged: boolean;
}

interface AlertSystemProps {
  className?: string;
}

const AlertSystem: React.FC<AlertSystemProps> = ({ className = '' }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isMinimized, setIsMinimized] = useState(true); // Start minimized by default
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // Fetch active alerts from API every 1 hour
  useEffect(() => {
    const fetchAlerts = async (isRefresh: boolean = false) => {
      try {
        console.log('🚨 [ALERTS] Fetching alerts...', { isRefresh });
        const result = await fetchActiveAlerts(isRefresh);
        
        console.log('🚨 [ALERTS] Fetch result:', {
          alertsCount: result.alerts.length,
          isLoading: result.isLoading,
          error: result.error
        });
        
        setIsLoading(result.isLoading);
        setError(result.error);
        
        if (result.alerts.length > 0 || !result.error) {
          // Convert ProcessedAlert to Alert (add acknowledged field)
          const newAlerts: Alert[] = result.alerts.map(alert => {
            // Check if this alert was already acknowledged
            const existingAlert = alerts.find(a => a.id === alert.id);
            return {
              ...alert,
              acknowledged: existingAlert?.acknowledged || false
            };
          });

          // Check for new critical alerts to play sound
          const newCriticalAlerts = newAlerts.filter(alert => 
            alert.alertType === 'critical' && 
            !alert.acknowledged &&
            !alerts.some(existing => existing.id === alert.id)
          );

          console.log('🚨 [ALERTS] Setting alerts:', {
            totalAlerts: newAlerts.length,
            newCriticalAlerts: newCriticalAlerts.length,
            alertTypes: newAlerts.reduce((acc, alert) => {
              acc[alert.alertType] = (acc[alert.alertType] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          });

          setAlerts(newAlerts);
          setLastUpdateTime(new Date());
          
          // Play alert sound if enabled and there are new critical alerts
          if (soundEnabled && newCriticalAlerts.length > 0) {
            playAlertSound();
          }
        }
      } catch (error) {
        console.error('🚨 [ALERTS] Failed to fetch alerts:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
        setIsLoading(false);
      }
    };

    const interval = setInterval(() => fetchAlerts(false), 3600000); // 1 hour (3600 seconds)
    fetchAlerts(false); // Initial fetch

    return () => clearInterval(interval);
  }, [soundEnabled]); // Removed alerts dependency to avoid infinite loop

  const playAlertSound = () => {
    // Create a simple beep sound
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      )
    );
  };

  const clearAllAlerts = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, acknowledged: true })));
  };

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      console.log('🚨 [ALERTS] Manual refresh triggered - clearing cache first');
      clearAlertsCache(); // Clear cache before refresh
      const result = await refreshAlerts();
      
      console.log('🚨 [ALERTS] Refresh result:', {
        alertsCount: result.alerts.length,
        isLoading: result.isLoading,
        error: result.error
      });
      
      setIsLoading(result.isLoading);
      setError(result.error);
      
      if (result.alerts.length > 0 || !result.error) {
        const newAlerts: Alert[] = result.alerts.map(alert => {
          const existingAlert = alerts.find(a => a.id === alert.id);
          return {
            ...alert,
            acknowledged: existingAlert?.acknowledged || false
          };
        });
        
        console.log('🚨 [ALERTS] Setting new alerts:', newAlerts.length);
        setAlerts(newAlerts);
        setLastUpdateTime(new Date());
      }
    } catch (error) {
      console.error('Failed to refresh alerts:', error);
      setError(error instanceof Error ? error.message : 'Failed to refresh alerts');
      setIsLoading(false);
    }
  };

  const getAlertIcon = (alertType: 'critical' | 'warning' | 'disconnect') => {
    switch (alertType) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'disconnect':
        return <X className="w-5 h-5 text-gray-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAlertColor = (alertType: 'critical' | 'warning' | 'disconnect') => {
    switch (alertType) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50';
      case 'disconnect':
        return 'border-gray-500 bg-gray-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const activeAlerts = alerts.filter(a => !a.acknowledged);
  const criticalAlerts = activeAlerts.filter(a => a.alertType === 'critical');

  if (isMinimized) {
    return (
      <div className={`relative inline-block ${className}`}>
        <button
          onClick={() => setIsMinimized(false)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-all ${
            criticalAlerts.length > 0 
              ? 'bg-red-500 text-white animate-pulse' 
              : isLoading
              ? 'bg-blue-500 text-white'
              : error
              ? 'bg-orange-500 text-white'
              : 'bg-gray-500 text-white'
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : error ? (
            <WifiOff className="w-4 h-4" />
          ) : (
            <Bell className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            {isLoading 
              ? 'Loading Alerts...'
              : error
              ? 'Connection Error'
              : criticalAlerts.length > 0 
              ? `${criticalAlerts.length} Critical Alert${criticalAlerts.length !== 1 ? 's' : ''}`
              : 'No Critical Alerts'
            }
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className={`alert-system fixed top-4 right-4 w-80 z-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            ) : error ? (
              <WifiOff className="w-5 h-5 text-orange-600" />
            ) : (
              <Wifi className="w-5 h-5 text-green-600" />
            )}
            <h3 className="font-semibold text-gray-800">Silo Monitoring Alerts</h3>
            {activeAlerts.length > 0 && (
              <span className={`text-white text-xs px-2 py-1 rounded-full ${
                criticalAlerts.length > 0 ? 'bg-red-500' : 
                activeAlerts.filter(a => a.alertType === 'warning').length > 0 ? 'bg-yellow-500' : 
                'bg-gray-500'
              }`}>
                {activeAlerts.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
              title="Refresh alerts"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1 hover:bg-gray-100 rounded"
              title={soundEnabled ? 'Disable sound' : 'Enable sound'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-gray-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-600" />
              )}
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Status and Alert summary */}
        <div className="p-3 bg-gray-50 border-b border-gray-200">
          <div className="space-y-2">
            {/* Connection Status */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Status:</span>
                {isLoading ? (
                  <span className="text-blue-600 font-medium">Loading alerts...</span>
                ) : error ? (
                  <span className="text-orange-600 font-medium">Connection error</span>
                ) : (
                  <span className="text-green-600 font-medium">Connected</span>
                )}
              </div>
              {lastUpdateTime && (
                <span className="text-gray-500">
                  Last update: {lastUpdateTime.toLocaleTimeString()}
                </span>
              )}
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
                <strong>Error:</strong> {error}
              </div>
            )}
            
            {/* Alert Summary */}
            {activeAlerts.length > 0 && (
              <div className="flex justify-between items-center text-sm pt-1 border-t border-gray-200">
                <div className="space-y-1">
                  {criticalAlerts.length > 0 && (
                    <div className="text-red-600 font-medium">
                      {criticalAlerts.length} Critical Alert{criticalAlerts.length !== 1 ? 's' : ''}
                    </div>
                  )}
                  {activeAlerts.filter(a => a.alertType === 'warning').length > 0 && (
                    <div className="text-yellow-600 font-medium">
                      {activeAlerts.filter(a => a.alertType === 'warning').length} Warning Alert{activeAlerts.filter(a => a.alertType === 'warning').length !== 1 ? 's' : ''}
                    </div>
                  )}
                  {activeAlerts.filter(a => a.alertType === 'disconnect').length > 0 && (
                    <div className="text-gray-600 font-medium">
                      {activeAlerts.filter(a => a.alertType === 'disconnect').length} Disconnect Alert{activeAlerts.filter(a => a.alertType === 'disconnect').length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <button
                  onClick={clearAllAlerts}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Alert list */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading && activeAlerts.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Loader2 className="w-8 h-8 mx-auto mb-2 text-blue-500 animate-spin" />
              <p>Loading alerts...</p>
              <p className="text-xs">This may take several minutes</p>
            </div>
          ) : activeAlerts.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No active alerts</p>
              <p className="text-xs">All silos operating normally</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {activeAlerts
                .sort((a, b) => {
                  // Sort by alert type priority and then by active time (newest first)
                  const priorityOrder = { critical: 3, warning: 2, disconnect: 1 };
                  const priorityDiff = priorityOrder[b.alertType] - priorityOrder[a.alertType];
                  
                  if (priorityDiff !== 0) {
                    return priorityDiff;
                  }
                  
                  return b.activeSince.getTime() - a.activeSince.getTime();
                })
                .map(alert => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border-l-4 ${getAlertColor(alert.alertType)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        {getAlertIcon(alert.alertType)}
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">
                            Silo {alert.siloNumber} - {alert.siloGroup}
                          </div>
                          <div className="text-sm text-gray-600 capitalize">
                            {alert.alertType} Alert
                          </div>
                          {alert.alertType !== 'disconnect' && (
                            <div className="text-sm text-gray-600">
                              Max Temperature: {alert.maxTemp.toFixed(1)}°C
                            </div>
                          )}
                          <div className="text-sm text-gray-600">
                            Affected Levels: {alert.affectedLevels.join(', ')}
                          </div>
                          
                          {/* Time and Date Information */}
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              <span>Active Since: {formatAlertTimestamp(alert.activeSince)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>Duration: {alert.duration}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <span>Last Update: {formatAlertTimestamp(alert.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Acknowledge alert"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertSystem;
