import React from 'react';
import AlertSiloMonitoring from '../components/AlertSiloMonitoring';

/**
 * Silo Monitoring Page
 * 
 * Enhanced monitoring page focused on alert silos only.
 * Features:
 * - Shows only silos with temperature alerts
 * - Real-time alert monitoring
 * - Priority-based display (critical first)
 * - Removed data management features
 */
const SiloMonitoring: React.FC = () => {
  return (
    <div className="silo-monitoring-page min-h-screen bg-gray-50">
      <AlertSiloMonitoring />
    </div>
  );
};

export default SiloMonitoring;
