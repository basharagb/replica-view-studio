import React, { useState, useEffect } from 'react';
import { AlertTriangle, Bell, X, Volume2, VolumeX } from 'lucide-react';
import { getAlertLevel, getAllSilos } from '../services/siloData';
import { AlertLevel } from '../types/silo';

interface Alert {
  id: string;
  siloNumber: number;
  temperature: number;
  level: AlertLevel;
  timestamp: Date;
  acknowledged: boolean;
}

interface AlertSystemProps {
  className?: string;
}

const AlertSystem: React.FC<AlertSystemProps> = ({ className = '' }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  // Check for new alerts every 5 seconds
  useEffect(() => {
    const checkAlerts = () => {
      const silos = getAllSilos();
      const newAlerts: Alert[] = [];

      silos.forEach(silo => {
        const alertLevel = getAlertLevel(silo.temp);
        if (alertLevel !== 'none') {
          const existingAlert = alerts.find(a => 
            a.siloNumber === silo.num && !a.acknowledged
          );

          if (!existingAlert) {
            newAlerts.push({
              id: `${silo.num}-${Date.now()}`,
              siloNumber: silo.num,
              temperature: silo.temp,
              level: alertLevel,
              timestamp: new Date(),
              acknowledged: false
            });
          }
        }
      });

      if (newAlerts.length > 0) {
        setAlerts(prev => [...prev, ...newAlerts]);
        
        // Play alert sound if enabled
        if (soundEnabled && newAlerts.some(a => a.level === 'critical')) {
          playAlertSound();
        }
      }
    };

    const interval = setInterval(checkAlerts, 5000);
    checkAlerts(); // Initial check

    return () => clearInterval(interval);
  }, [alerts, soundEnabled]);

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

  const getAlertIcon = (level: AlertLevel) => {
    switch (level) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAlertColor = (level: AlertLevel) => {
    switch (level) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const activeAlerts = alerts.filter(a => !a.acknowledged);
  const criticalAlerts = activeAlerts.filter(a => a.level === 'critical');
  const warningAlerts = activeAlerts.filter(a => a.level === 'warning');

  if (isMinimized) {
    return (
      <div className={`relative inline-block ${className}`}>
        <button
          onClick={() => setIsMinimized(false)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-all ${
            criticalAlerts.length > 0 
              ? 'bg-red-500 text-white animate-pulse' 
              : warningAlerts.length > 0
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-500 text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span className="text-sm font-medium">
            {activeAlerts.length} Alert{activeAlerts.length !== 1 ? 's' : ''}
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
            <Bell className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">Temperature Alerts</h3>
            {activeAlerts.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {activeAlerts.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
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

        {/* Alert summary */}
        {activeAlerts.length > 0 && (
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-red-600 font-medium">
                {criticalAlerts.length} Critical
              </span>
              <span className="text-yellow-600 font-medium">
                {warningAlerts.length} Warning
              </span>
              <button
                onClick={clearAllAlerts}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Alert list */}
        <div className="max-h-96 overflow-y-auto">
          {activeAlerts.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No active alerts</p>
              <p className="text-xs">All temperatures within normal range</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {activeAlerts
                .sort((a, b) => {
                  // Sort by level (critical first) then by timestamp
                  if (a.level !== b.level) {
                    return a.level === 'critical' ? -1 : 1;
                  }
                  return b.timestamp.getTime() - a.timestamp.getTime();
                })
                .map(alert => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border-l-4 ${getAlertColor(alert.level)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        {getAlertIcon(alert.level)}
                        <div>
                          <div className="font-medium text-gray-800">
                            Silo {alert.siloNumber}
                          </div>
                          <div className="text-sm text-gray-600">
                            Temperature: {alert.temperature.toFixed(1)}°C
                          </div>
                          <div className="text-xs text-gray-500">
                            {alert.timestamp.toLocaleTimeString()}
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
