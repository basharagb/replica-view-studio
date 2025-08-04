import React from 'react';
import SiloMonitoringDemo from '../components/SiloMonitoringDemo';

/**
 * Silo Monitoring Page
 * 
 * Main page component for the comprehensive silo temperature monitoring system.
 * Demonstrates the complete implementation of:
 * - 8-sensor monitoring per silo
 * - Three-tier color coding system
 * - Priority-based status determination
 * - Real-time updates
 */
const SiloMonitoring: React.FC = () => {
  return (
    <div className="silo-monitoring-page min-h-screen bg-gray-50">
      <SiloMonitoringDemo />
    </div>
  );
};

export default SiloMonitoring;
