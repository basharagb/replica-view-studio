import { useEffect, useState } from 'react';
import { LabGroup } from './LabGroup';
import { LabCircle } from './LabCircle';
import { LabNumberSquare } from './LabNumberSquare';
import { LabCylinder } from './LabCylinder';
import { GrainLevelCylinder } from './GrainLevelCylinder';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useSiloSystem } from '../hooks/useSiloSystem';
import { topSiloGroups, bottomSiloGroups, temperatureScaleValues } from '../services/siloData';
import EnhancedTemperatureDisplay from './EnhancedTemperatureDisplay';
import EnhancedSensorPanel from './EnhancedSensorPanel';
import AlertSystem from './AlertSystem';
import { MaintenanceCablePopup } from './MaintenanceCablePopup';

export const MaintenanceInterface = () => {
  const {
    selectedSilo,
    selectedTemp,
    hoveredSilo,
    tooltipPosition,
    readingMode,
    isReading,
    readingSilo,
    dataVersion,
    manualTestDuration,
    handleSiloClick,
    handleSiloHover,
    handleSiloMouseMove,
    handleSiloLeave,
    handleManualReadMode,
    setSelectedSilo,
    cleanup
  } = useSiloSystem();

  const [showCablePopup, setShowCablePopup] = useState(false);
  const [selectedSiloForPopup, setSelectedSiloForPopup] = useState<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value)) {
      setSelectedSilo(value);
    }
  };

  // Enhanced silo click handler for Maintenance mode
  const handleMaintenanceSiloClick = (siloNumber: number, event: React.MouseEvent) => {
    // First handle the normal silo click (color change, etc.)
    handleSiloClick(siloNumber, event);
    
    // Then show the cable popup
    setSelectedSiloForPopup(siloNumber);
    setShowCablePopup(true);
  };

  const handleCloseCablePopup = () => {
    setShowCablePopup(false);
    setSelectedSiloForPopup(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full">
      {/* Left Panel - Silo Groups */}
      <div className="flex-1 space-y-4 lg:space-y-6">
        {/* Top Silo Groups */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
          {topSiloGroups.map((group) => (
            <LabGroup key={group.id} title={group.title}>
              <div className="grid grid-cols-5 gap-1 sm:gap-2">
                {group.circles.map((circle) => (
                  <LabCircle
                    key={circle.number}
                    number={circle.number}
                    color={circle.color}
                    onClick={(event) => handleMaintenanceSiloClick(circle.number, event)}
                    onHover={handleSiloHover}
                    onMouseMove={handleSiloMouseMove}
                    onLeave={handleSiloLeave}
                    isSelected={selectedSilo === circle.number}
                    isReading={isReading && readingSilo === circle.number}
                    dataVersion={dataVersion}
                  />
                ))}
              </div>
            </LabGroup>
          ))}
        </div>

        {/* Bottom Silo Groups */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
          {bottomSiloGroups.map((group) => (
            <LabGroup key={group.id} title={group.title}>
              <div className="grid grid-cols-5 gap-1 sm:gap-2">
                {group.squares.map((square) => (
                  <LabNumberSquare
                    key={square.number}
                    number={square.number}
                    color={square.color}
                    onClick={(event) => handleMaintenanceSiloClick(square.number, event)}
                    onHover={handleSiloHover}
                    onMouseMove={handleSiloMouseMove}
                    onLeave={handleSiloLeave}
                    isSelected={selectedSilo === square.number}
                    isReading={isReading && readingSilo === square.number}
                    dataVersion={dataVersion}
                  />
                ))}
              </div>
            </LabGroup>
          ))}
        </div>
      </div>

      {/* Right Panel - Controls and Displays */}
      <div className="w-full lg:w-80 xl:w-96 space-y-4 lg:space-y-6">
        {/* Manual Test Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Manual Test Controls
          </h3>
          
          <div className="space-y-4">
            {/* Silo Selection Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Silo Number
              </label>
              <Input
                type="number"
                value={selectedSilo || ''}
                onChange={handleInputChange}
                placeholder="Enter silo number"
                className="w-full"
                min="1"
                max="150"
              />
            </div>

            {/* Manual Test Button */}
            <Button
              onClick={() => selectedSilo && handleManualReadMode(selectedSilo)}
              disabled={!selectedSilo || isReading}
              className="w-full"
              variant="default"
            >
              {isReading ? 'Testing...' : 'Start Manual Test'}
            </Button>

            {/* Test Duration Display */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Test Duration: {manualTestDuration}ms
            </div>
          </div>
        </div>

        {/* Temperature Display */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700" style={{ height: '400px', minHeight: '400px' }}>
          <EnhancedTemperatureDisplay
            selectedSilo={selectedSilo}
            selectedTemp={selectedTemp}
            temperatureScaleValues={temperatureScaleValues}
            dataVersion={dataVersion}
          />
        </div>

        {/* Sensor Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700" style={{ height: '400px', minHeight: '400px' }}>
          <div className="flex h-full">
            <div className="flex-1">
              <LabCylinder
                selectedSilo={selectedSilo}
                dataVersion={dataVersion}
              />
            </div>
            <div className="flex-1">
              <GrainLevelCylinder
                selectedSilo={selectedSilo}
                dataVersion={dataVersion}
              />
            </div>
          </div>
        </div>

        {/* Enhanced Sensor Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <EnhancedSensorPanel
            selectedSilo={selectedSilo}
            dataVersion={dataVersion}
          />
        </div>
      </div>

      {/* Tooltip */}
      {hoveredSilo && tooltipPosition && (
        <div
          className="fixed z-50 bg-gray-900 text-white px-2 py-1 rounded text-sm pointer-events-none"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 30,
          }}
        >
          Silo {hoveredSilo}
        </div>
      )}

      {/* Alert System */}
      <AlertSystem />

      {/* Cable Popup */}
      {showCablePopup && selectedSiloForPopup && (
        <MaintenanceCablePopup
          siloNumber={selectedSiloForPopup}
          onClose={handleCloseCablePopup}
        />
      )}
    </div>
  );
};
