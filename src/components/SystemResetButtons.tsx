import React, { useState } from 'react';
import { RotateCcw, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { clearSensorReadingsCache, regenerateAllSiloData, clearAutoTestState } from '../services/siloData';
import { clearSiloDataCache, clearPersistentSiloCache } from '../services/realSiloApiService';

interface SystemResetButtonsProps {
  onAutoTestStop?: () => void;
  isAutoTestRunning?: boolean;
}

const SystemResetButtons: React.FC<SystemResetButtonsProps> = ({ 
  onAutoTestStop,
  isAutoTestRunning = false 
}) => {
  const [showSysResetDialog, setShowSysResetDialog] = useState(false);
  const [showReloadDialog, setShowReloadDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSysReset = async () => {
    setIsProcessing(true);
    try {
      // Clear browser cache (localStorage) - this will clear all persistent data
      localStorage.clear();
      
      // Clear sensor readings cache
      clearSensorReadingsCache();
      
      // Clear silo data cache (including persistent storage)
      clearSiloDataCache();
      
      // Clear persistent silo cache specifically
      clearPersistentSiloCache();
      
      console.log('System reset completed - all caches cleared');
      
      // Show success message
      alert('System reset completed successfully! All cached data cleared. Redirecting to login...');
      
      // Redirect to login page after clearing cache
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during system reset:', error);
      alert('Error during system reset. Please try again.');
    } finally {
      setIsProcessing(false);
      setShowSysResetDialog(false);
    }
  };

  const handleReload = async () => {
    setIsProcessing(true);
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
      
      console.log('System reload completed - all silos reset to wheat color');
      
      // Show success message
      alert('System reloaded successfully! All silos reset to wheat color. Redirecting to login...');
      
      // Redirect to login page after reload
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during system reload:', error);
      alert('Error during system reload. Please try again.');
    } finally {
      setIsProcessing(false);
      setShowReloadDialog(false);
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            System Reset Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sys Reset Button */}
            <Button
              onClick={() => setShowSysResetDialog(true)}
              variant="destructive"
              className="flex items-center gap-2 h-12"
              disabled={isProcessing}
            >
              <Trash2 className="w-4 h-4" />
              <div className="text-left">
                <div className="font-medium">Sys Reset</div>
                <div className="text-xs opacity-90">Clear all cache & restart</div>
              </div>
            </Button>

            {/* Reload Button */}
            <Button
              onClick={() => setShowReloadDialog(true)}
              variant="outline"
              className="flex items-center gap-2 h-12 border-orange-500 text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950"
              disabled={isProcessing}
            >
              <RotateCcw className="w-4 h-4" />
              <div className="text-left">
                <div className="font-medium">Reload</div>
                <div className="text-xs opacity-90">Reset silos to wheat color</div>
              </div>
            </Button>
          </div>

          <div className="text-sm text-muted-foreground bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">Warning:</p>
                <p className="text-yellow-700 dark:text-yellow-300">
                  <strong>Sys Reset</strong> clears all cached data including tested silo colors and sensor readings. 
                  <strong>Reload</strong> resets all silos to wheat color and stops auto test.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sys Reset Confirmation Dialog */}
      <Dialog open={showSysResetDialog} onOpenChange={setShowSysResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Confirm System Reset
            </DialogTitle>
            <DialogDescription className="space-y-2">
              <p>
                This will perform a complete system reset by clearing:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>All browser cache and localStorage data</li>
                <li>All tested silo colors and sensor readings</li>
                <li>All persistent silo data storage</li>
                <li>Auto test state and progress</li>
              </ul>
              <p className="font-medium text-red-600 dark:text-red-400">
                This action cannot be undone. All tested silo data will be lost.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSysResetDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSysReset}
              disabled={isProcessing}
            >
              {isProcessing ? 'Resetting...' : 'Confirm System Reset'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reload Confirmation Dialog */}
      <Dialog open={showReloadDialog} onOpenChange={setShowReloadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <RotateCcw className="w-5 h-5" />
              Confirm System Reload
            </DialogTitle>
            <DialogDescription className="space-y-2">
              <p>
                This will reload the system by:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Stopping auto test if currently running</li>
                <li>Resetting all silos to wheat color</li>
                <li>Clearing sensor readings cache</li>
                <li>Clearing auto test state</li>
                <li>Reloading the page for clean state</li>
              </ul>
              <p className="font-medium text-orange-600 dark:text-orange-400">
                All current silo colors and test progress will be lost.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReloadDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              className="border-orange-500 text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950"
              onClick={handleReload}
              disabled={isProcessing}
            >
              {isProcessing ? 'Reloading...' : 'Confirm Reload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SystemResetButtons;
