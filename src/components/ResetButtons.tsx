import React from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import { clearSensorReadingsCache, regenerateAllSiloData, clearAutoTestState } from '../services/siloData';

interface ResetButtonsProps {
  className?: string;
  onAutoTestStop?: () => void;
  isAutoTestRunning?: boolean;
}

const ResetButtons: React.FC<ResetButtonsProps> = ({ 
  className = '', 
  onAutoTestStop,
  isAutoTestRunning = false 
}) => {
  
  const handleClearCache = () => {
    try {
      // Clear browser cache (localStorage)
      localStorage.clear();
      
      // Clear sensor readings cache
      clearSensorReadingsCache();
      
      // Show confirmation
      alert('Cache cleared successfully!');
      
      // Reload the page to ensure clean state
      window.location.reload();
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('Error clearing cache. Please try again.');
    }
  };

  const handleResetAll = () => {
    const confirmed = window.confirm(
      'This will reset all silos to wheat color, clear all data, and stop auto test if running. Are you sure?'
    );
    
    if (confirmed) {
      try {
        // Stop auto test if running
        if (isAutoTestRunning && onAutoTestStop) {
          onAutoTestStop();
        }
        
        // Clear auto test state
        clearAutoTestState();
        
        // Clear sensor readings cache
        clearSensorReadingsCache();
        
        // Regenerate all silo data (resets to wheat color)
        regenerateAllSiloData();
        
        // Clear localStorage
        localStorage.clear();
        
        // Show confirmation
        alert('System reset successfully! All silos reset to wheat color.');
        
        // Reload the page to ensure clean state
        window.location.reload();
      } catch (error) {
        console.error('Error resetting system:', error);
        alert('Error resetting system. Please try again.');
      }
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* Clear Cache Button */}
      <button
        onClick={handleClearCache}
        className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-all"
        title="Clear cache and restart"
      >
        <Trash2 className="w-4 h-4" />
        <span className="text-sm font-medium">Clear Cache</span>
      </button>

      {/* Reset All Button */}
      <button
        onClick={handleResetAll}
        className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg shadow-lg hover:bg-orange-600 transition-all"
        title="Reset all silos to wheat color and stop auto test"
      >
        <RotateCcw className="w-4 h-4" />
        <span className="text-sm font-medium">Reset All</span>
      </button>
    </div>
  );
};

export default ResetButtons;
