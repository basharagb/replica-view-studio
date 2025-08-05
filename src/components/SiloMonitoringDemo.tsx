import React from 'react';
import SiloMonitoringSystem from './SiloMonitoringSystem';
import { AlertTriangle, Info } from 'lucide-react';

/**
 * Silo Monitoring Demo Component
 * 
 * Demonstrates the complete silo monitoring system with:
 * - Multiple silos showing different status scenarios
 * - Real-time sensor monitoring
 * - Priority-based status determination
 * - Three-tier color coding system
 */
const SiloMonitoringDemo: React.FC = () => {
  return (
    <div className="silo-monitoring-demo p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Silo Temperature Monitoring System
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Continuous monitoring of 8 sensor readings per silo with strict three-tier color coding 
          and priority-based overall status determination.
        </p>
      </div>

      {/* System Overview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-800 mb-2">System Specifications</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div>• <strong>8 sensors per silo</strong> - Continuous temperature monitoring</div>
              <div>• <strong>Three-tier color coding:</strong> Green (20-35°C), Yellow (35-40°C), Red (40°C+)</div>
              <div>• <strong>Priority hierarchy:</strong> Red (Critical) → Yellow (Warning) → Green (Normal)</div>
              <div>• <strong>Overall status:</strong> Determined by highest priority sensor reading</div>
              <div>• <strong>Real-time updates:</strong> Sensor readings refresh every 5 seconds</div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Rules */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-800 mb-2">Status Determination Rules</h3>
            <div className="text-sm text-amber-700 space-y-1">
              <div>1. <strong>Red Status:</strong> If ANY sensor reads ≥40°C, entire silo shows RED (Critical)</div>
              <div>2. <strong>Yellow Status:</strong> If ANY sensor reads 35-39.99°C AND no red sensors, silo shows YELLOW (Warning)</div>
              <div>3. <strong>Green Status:</strong> If ALL sensors read 20-34.99°C, silo shows GREEN (Normal)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Silo Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Generate 9 silos for demonstration */}
        {Array.from({ length: 9 }, (_, index) => (
          <SiloMonitoringSystem
            key={index + 1}
            siloNumber={index + 1}
            className="shadow-lg hover:shadow-xl transition-shadow duration-200"
          />
        ))}
      </div>

      {/* Footer Information */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          Sensor readings are simulated and update every 5 seconds to demonstrate 
          the monitoring system's real-time capabilities and priority-based status determination.
        </p>
      </div>
    </div>
  );
};

export default SiloMonitoringDemo;
