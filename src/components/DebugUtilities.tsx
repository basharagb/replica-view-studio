import React, { useState } from 'react';
import { Button } from './ui/button';
import { clearAllCaches, clearSiloCaches, clearScheduleCaches } from '../utils/clearAllCaches';

/**
 * Debug Utilities Component
 * 
 * Provides debugging tools and cache management utilities for development and troubleshooting.
 * This component should only be visible in development or when explicitly enabled.
 */

interface DebugUtilitiesProps {
  isVisible?: boolean;
}

export const DebugUtilities: React.FC<DebugUtilitiesProps> = ({ isVisible = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');

  if (!isVisible) {
    return null;
  }

  const handleClearAllCaches = () => {
    try {
      clearAllCaches();
      setLastAction('✅ All caches cleared successfully');
      setTimeout(() => setLastAction(''), 3000);
    } catch (error) {
      setLastAction('❌ Failed to clear all caches');
      console.error('Failed to clear all caches:', error);
      setTimeout(() => setLastAction(''), 3000);
    }
  };

  const handleClearSiloCaches = () => {
    try {
      clearSiloCaches();
      setLastAction('✅ Silo caches cleared successfully');
      setTimeout(() => setLastAction(''), 3000);
    } catch (error) {
      setLastAction('❌ Failed to clear silo caches');
      console.error('Failed to clear silo caches:', error);
      setTimeout(() => setLastAction(''), 3000);
    }
  };

  const handleClearScheduleCaches = () => {
    try {
      clearScheduleCaches();
      setLastAction('✅ Schedule caches cleared successfully');
      setTimeout(() => setLastAction(''), 3000);
    } catch (error) {
      setLastAction('❌ Failed to clear schedule caches');
      console.error('Failed to clear schedule caches:', error);
      setTimeout(() => setLastAction(''), 3000);
    }
  };

  const handleRefreshPage = () => {
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isExpanded ? (
        <Button
          onClick={() => setIsExpanded(true)}
          variant="outline"
          size="sm"
          className="bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200"
        >
          🔧 Debug
        </Button>
      ) : (
        <div className="bg-white border-2 border-yellow-300 rounded-lg shadow-lg p-4 min-w-[300px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">🔧 Debug Utilities</h3>
            <Button
              onClick={() => setIsExpanded(false)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              ✕
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="text-xs text-gray-600 mb-3">
              Cache Management Tools
            </div>
            
            <Button
              onClick={handleClearAllCaches}
              variant="outline"
              size="sm"
              className="w-full text-xs"
            >
              🧹 Clear All Caches
            </Button>
            
            <Button
              onClick={handleClearSiloCaches}
              variant="outline"
              size="sm"
              className="w-full text-xs"
            >
              🗑️ Clear Silo Caches
            </Button>
            
            <Button
              onClick={handleClearScheduleCaches}
              variant="outline"
              size="sm"
              className="w-full text-xs"
            >
              📅 Clear Schedule Caches
            </Button>
            
            <hr className="my-2" />
            
            <Button
              onClick={handleRefreshPage}
              variant="default"
              size="sm"
              className="w-full text-xs bg-blue-600 hover:bg-blue-700"
            >
              🔄 Refresh Page
            </Button>
            
            {lastAction && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-center">
                {lastAction}
              </div>
            )}
            
            <div className="text-xs text-gray-500 mt-2">
              💡 Clear caches if silos show wrong colors during auto reading
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugUtilities;
