import React from 'react';
import { MaintenanceInterface } from "../components/MaintenanceInterface";

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Page Header - Similar to Live Readings but with Maintenance title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Maintenance
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manual silo maintenance and cable testing interface
          </p>
        </div>
        
        {/* Main Maintenance Interface */}
        <MaintenanceInterface />
      </div>
    </div>
  );
};

export default Maintenance;
