import { useEffect } from 'react';
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

import AlertSystem from './AlertSystem';


interface LabInterfaceProps {
  onSiloClick?: (siloNumber: number) => void;
}

export const LabInterface = ({ onSiloClick }: LabInterfaceProps) => {
  const {
    selectedSilo,
    selectedTemp,
    hoveredSilo,
    tooltipPosition,
    readingMode,
    isReading,
    readingSilo,
    autoReadProgress,
    autoReadCompleted,
    dataVersion,
    manualTestDuration,
    autoTestInterval,
    isWaitingForRestart,
    waitTimeRemaining,
    handleSiloClick,
    handleSiloHover,
    handleSiloMouseMove,
    handleSiloLeave,
    startAutoRead,
    handleManualReadMode,
    setSelectedSilo,
    cleanup
  } = useSiloSystem();

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

  // Combined click handler for maintenance integration
  const handleCombinedSiloClick = (siloNumber: number) => {
    // Call the original silo click handler for existing functionality
    handleSiloClick(siloNumber);
    
    // Call the optional maintenance popup handler if provided
    if (onSiloClick) {
      onSiloClick(siloNumber);
    }
  };

  // Create bottom row data (simplified groups with 3 circles each)
  const bottomRowData = bottomSiloGroups.map(group => ({
    circles: [
      ...(group.row1?.slice(0, 3) || [])
    ],
    squares: (group.row2?.slice(0, 5) || []).map(silo => silo.num)
  }));

  return (
    <div className="min-h-screen bg-background p-8" data-testid="lab-interface">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-8 2xl:gap-12 3xl:gap-16">
          {/* Main lab area */}
          <div className="flex-1 space-y-12 2xl:space-y-16 3xl:space-y-20">
            {/* Top section (1-55) - First 3 rows */}
            <div className="bg-gray-50 p-6 2xl:p-8 3xl:p-10 rounded-lg border-2 border-gray-200" data-testid="top-silo-section" key={`top-${dataVersion}`}>
              <div className="flex gap-6 2xl:gap-8 3xl:gap-10 justify-center">
                {topSiloGroups.map((group, index) => (
                  <div key={index} className="relative">
                    <LabGroup
                      circles={[
                        ...(group.topRow || []),
                        ...(group.bottomRow || [])
                      ]}
                      squares={group.middleRow?.map(silo => silo.num) || []}
                      selectedSilo={selectedSilo}
                      readingSilo={readingSilo}
                      hoveredSilo={hoveredSilo}
                      onSiloClick={handleCombinedSiloClick}
                      onSiloHover={handleSiloHover}
                      onSiloLeave={handleSiloLeave}
                      onSiloMouseMove={handleSiloMouseMove}
                    />
                    {/* Visual separator between groups */}
                    {index < topSiloGroups.length - 1 && (
                      <div className="absolute -right-3 top-0 bottom-0 w-px bg-gray-400"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom section (101-195) - All 5 rows */}
            <div className="bg-gray-50 p-6 2xl:p-8 3xl:p-10 rounded-lg border-2 border-gray-200" data-testid="bottom-silo-section" key={`bottom-${dataVersion}`}>
              <div className="flex gap-6 2xl:gap-8 3xl:gap-10 justify-center">
                {bottomSiloGroups.map((group, index) => (
                  <div key={index} className="relative">
                    <div className="flex flex-col items-center gap-0">
                      {/* Row 1: circles */}
                      <div className="flex gap-0">
                        {(group.row1 || []).slice(0, 3).map((circle) => (
                          <LabCircle
                            key={`row1-${circle.num}`}
                            number={circle.num}
                            temp={circle.temp}
                            isSelected={selectedSilo === circle.num}
                            isReading={readingSilo === circle.num}
                            isHovered={hoveredSilo?.num === circle.num}
                            onClick={handleSiloClick}
                            onMouseEnter={handleSiloHover}
                            onMouseLeave={handleSiloLeave}
                            onMouseMove={handleSiloMouseMove}
                          />
                        ))}
                      </div>
                      
                      {/* Row 2: squares */}
                      <div className="flex gap-0">
                        {(group.row2 || []).slice(0, 5).map((silo) => (
                          <LabNumberSquare
                            key={`row2-${silo.num}`}
                            number={silo.num}
                            isSelected={selectedSilo === silo.num}
                            isReading={readingSilo === silo.num}
                            isHovered={hoveredSilo?.num === silo.num}
                            onClick={handleSiloClick}
                            onMouseEnter={handleSiloHover}
                            onMouseLeave={handleSiloLeave}
                            onMouseMove={handleSiloMouseMove}
                          />
                        ))}
                      </div>
                      
                      {/* Row 3: circles */}
                      <div className="flex gap-0">
                        {(group.row3 || []).slice(0, 3).map((circle) => (
                          <LabCircle
                            key={`row3-${circle.num}`}
                            number={circle.num}
                            temp={circle.temp}
                            isSelected={selectedSilo === circle.num}
                            isReading={readingSilo === circle.num}
                            isHovered={hoveredSilo?.num === circle.num}
                            onClick={handleSiloClick}
                            onMouseEnter={handleSiloHover}
                            onMouseLeave={handleSiloLeave}
                            onMouseMove={handleSiloMouseMove}
                          />
                        ))}
                      </div>
                      
                      {/* Row 4: squares */}
                      <div className="flex gap-0">
                        {(group.row4 || []).slice(0, 5).map((silo) => (
                          <LabNumberSquare
                            key={`row4-${silo.num}`}
                            number={silo.num}
                            isSelected={selectedSilo === silo.num}
                            isReading={readingSilo === silo.num}
                            isHovered={hoveredSilo?.num === silo.num}
                            onClick={handleSiloClick}
                            onMouseEnter={handleSiloHover}
                            onMouseLeave={handleSiloLeave}
                            onMouseMove={handleSiloMouseMove}
                          />
                        ))}
                      </div>
                      
                      {/* Row 5: circles */}
                      <div className="flex gap-0">
                        {(group.row5 || []).slice(0, 3).map((circle) => (
                          <LabCircle
                            key={`row5-${circle.num}`}
                            number={circle.num}
                            temp={circle.temp}
                            isSelected={selectedSilo === circle.num}
                            isReading={readingSilo === circle.num}
                            isHovered={hoveredSilo?.num === circle.num}
                            onClick={handleSiloClick}
                            onMouseEnter={handleSiloHover}
                            onMouseLeave={handleSiloLeave}
                            onMouseMove={handleSiloMouseMove}
                          />
                        ))}
                      </div>
                    </div>
                    {/* Visual separator between groups */}
                    {index < bottomSiloGroups.length - 1 && (
                      <div className="absolute -right-3 top-0 bottom-0 w-px bg-gray-400"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side with cylinders, input, and controls */}
          <div className="flex flex-col items-center gap-4 2xl:gap-6 3xl:gap-8" data-testid="control-panel">
            {/* Cylinder Components Side by Side */}
            <div className="flex items-start" style={{ height: '352px', minHeight: '352px' }}>
              <div style={{ marginLeft: '-3px' }}>
                <LabCylinder
                  key={`cylinder-${dataVersion}`}
                  selectedSilo={selectedSilo}
                  readingSilo={readingSilo}
                  onSiloClick={handleCombinedSiloClick}
                  // LabCylinder is completely independent of hover state
                  // Only shows readings for selected or reading silo
                />
              </div>
              <GrainLevelCylinder
                key={`grain-cylinder-${dataVersion}`}
                selectedSilo={selectedSilo}
                readingSilo={readingSilo}
                onSiloClick={handleCombinedSiloClick}
                isAutoTestRunning={isReading}
              />
            </div>
            <div className="w-20 2xl:w-24 3xl:w-28">
              <Input
                value={selectedSilo}
                onChange={handleInputChange}
                className="text-center font-semibold"
                type="number"
                data-testid="silo-input"
              />
            </div>
            
            {/* Manual/Auto Readings Controls */}
            <div className="flex flex-col gap-2 items-center mt-4 2xl:mt-6 3xl:mt-8">
              <Button
                variant={readingMode === 'manual' ? 'default' : 'outline'}
                onClick={handleManualReadMode}
                disabled={isReading && readingMode === 'auto'}
                className="w-32 2xl:w-36 3xl:w-40"
                data-testid="manual-test-button"
              >
                {readingMode === 'manual' ? 'Stop Manual' : `Manual Readings (${manualTestDuration}min)`}
              </Button>
              <Button
                variant={readingMode === 'auto' ? 'default' : 'outline'}
                onClick={startAutoRead}
                disabled={(isReading && readingMode === 'manual') || isWaitingForRestart}
                className="w-32 2xl:w-36 3xl:w-40"
                data-testid="auto-test-button"
              >
                {isWaitingForRestart ? 'Waiting to Restart' : autoReadCompleted ? 'Auto Readings Completed' : readingMode === 'auto' ? 'Stop Auto Readings' : `Auto Readings (${autoTestInterval/60}h)`}
              </Button>
              
              {/* Auto Read Progress */}
              {readingMode === 'auto' && (
                <div className="w-48 2xl:w-56 3xl:w-64 mt-2" data-testid="auto-test-progress">
                  <div className="bg-gray-200 h-3 rounded">
                    <div
                      className="bg-green-500 h-3 rounded transition-all duration-300"
                      style={{ width: `${autoReadProgress}%` }}
                    />
                  </div>
                  <div className="text-xs mt-1 text-center">
                    {Math.round(autoReadProgress)}% complete
                  </div>
                </div>
              )}

              {/* Auto Restart Status */}
              {isWaitingForRestart && (
                <div className="mt-2 text-sm text-blue-600 font-medium">
                  ⏳ Waiting {waitTimeRemaining} minutes to restart auto readings
                </div>
              )}
              
              {/* Auto Read Completion Message */}
              {autoReadCompleted && readingMode === 'none' && !isWaitingForRestart && (
                <div className="mt-2 text-sm text-green-600 font-medium">
                  ✓ Auto readings completed successfully
                </div>
              )}

              {/* Reading Status */}
              {isReading && readingSilo && (
                <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Reading Silo {readingSilo === 1 ? 1 : readingSilo - 1}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Temperature Tooltip */}
      {hoveredSilo && (
        <div
          className="temperature-tooltip"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 30,
          }}
          data-testid="temperature-tooltip"
        >
          Silo {hoveredSilo.num}: {hoveredSilo.temp.toFixed(1)}°C
        </div>
      )}

      {/* Enhanced Alert System and Reset Buttons */}
      <div className="flex items-center gap-4 justify-between">
        <AlertSystem />
        <div className="text-sm text-muted-foreground">
          System reset controls moved to Settings → System tab
        </div>
      </div>
    </div>
  );
};
