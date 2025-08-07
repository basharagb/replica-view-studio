import { useEffect } from 'react';
import { LabGroup } from './LabGroup';
import { LabCircle } from './LabCircle';
import { LabNumberSquare } from './LabNumberSquare';
import { LabCylinder } from './LabCylinder';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useSiloSystem } from '../hooks/useSiloSystem';
import { topSiloGroups, bottomSiloGroups, temperatureScaleValues } from '../services/siloData';
import EnhancedTemperatureDisplay from './EnhancedTemperatureDisplay';
import EnhancedSensorPanel from './EnhancedSensorPanel';
import AlertSystem from './AlertSystem';

export const LabInterface = () => {
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

  // Create bottom row data (simplified groups with 3 circles each)
  const bottomRowData = bottomSiloGroups.map(group => ({
    circles: [
      ...(group.row1?.slice(0, 3) || [])
    ],
    squares: (group.row2?.slice(0, 5) || []).map(silo => silo.num)
  }));

  return (
    <div className="min-h-screen w-full bg-background p-2 sm:p-4 lg:p-6 xl:p-8" data-testid="lab-interface">
      <div className="w-full max-w-none">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 2xl:gap-12 3xl:gap-16 items-start justify-center">
          {/* Main lab area */}
          <div className="flex-1 w-full lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl space-y-8 lg:space-y-12 2xl:space-y-16 3xl:space-y-20">
            {/* Top section (1-55) - First 3 rows */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 2xl:p-8 3xl:p-10 rounded-lg border-2 border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg" data-testid="top-silo-section" key={`top-${dataVersion}`}>
              <div className="flex gap-6 2xl:gap-8 3xl:gap-10 justify-center">
                {topSiloGroups.map((group, index) => (
                  <div key={index} className="relative transform transition-all duration-200 hover:scale-105">
                    <LabGroup
                      circles={[
                        ...(group.topRow || []),
                        ...(group.bottomRow || [])
                      ]}
                      squares={group.middleRow?.map(silo => silo.num) || []}
                      selectedSilo={selectedSilo}
                      readingSilo={readingSilo}
                      hoveredSilo={hoveredSilo}
                      onSiloClick={handleSiloClick}
                      onSiloHover={handleSiloHover}
                      onSiloLeave={handleSiloLeave}
                      onSiloMouseMove={handleSiloMouseMove}
                    />
                    {/* Visual separator between groups */}
                    {index < topSiloGroups.length - 1 && (
                      <div className="absolute -right-3 top-0 bottom-0 w-px bg-gray-400 dark:bg-gray-600"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom section (101-195) - All 5 rows */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 2xl:p-8 3xl:p-10 rounded-lg border-2 border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg" data-testid="bottom-silo-section" key={`bottom-${dataVersion}`}>
              <div className="flex gap-6 2xl:gap-8 3xl:gap-10 justify-center">
                {bottomSiloGroups.map((group, index) => (
                  <div key={index} className="relative transform transition-all duration-200 hover:scale-105">
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
                      <div className="absolute -right-3 top-0 bottom-0 w-px bg-gray-400 dark:bg-gray-600"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side with cylinder, input, and controls */}
          <div className="flex flex-col lg:flex-col items-center gap-4 lg:gap-6 2xl:gap-8 3xl:gap-10 lg:min-w-[200px] xl:min-w-[240px]" data-testid="control-panel">
            <LabCylinder
              key={`cylinder-${dataVersion}`}
              selectedSilo={selectedSilo}
              readingSilo={readingSilo}
              onSiloClick={handleSiloClick}
              // LabCylinder is completely independent of hover state
              // Only shows readings for selected or reading silo
            />
            <div className="w-20 2xl:w-24 3xl:w-28">
              <Input
                value={selectedSilo}
                onChange={handleInputChange}
                className="text-center font-semibold"
                type="number"
                data-testid="silo-input"
              />
            </div>
            
            {/* Manual/Auto Test Controls */}
            <div className="flex flex-col gap-3 items-center mt-4 lg:mt-6 2xl:mt-8 w-full">
              <Button
                variant={readingMode === 'manual' ? 'default' : 'outline'}
                onClick={handleManualReadMode}
                disabled={isReading && readingMode === 'auto'}
                className="w-full max-w-[200px] lg:max-w-[220px] xl:max-w-[240px] text-xs lg:text-sm font-medium transition-all duration-200 hover:scale-105"
                data-testid="manual-test-button"
              >
                {readingMode === 'manual' ? 'Stop Manual Readings' : `Manual Readings (${manualTestDuration}min)`}
              </Button>
              <Button
                variant={readingMode === 'auto' ? 'default' : 'outline'}
                onClick={startAutoRead}
                disabled={(isReading && readingMode === 'manual') || isWaitingForRestart}
                className="w-full max-w-[200px] lg:max-w-[220px] xl:max-w-[240px] text-xs lg:text-sm font-medium transition-all duration-200 hover:scale-105"
                data-testid="auto-test-button"
              >
                {isWaitingForRestart ? 'Waiting to Restart' : autoReadCompleted ? 'Auto Readings Completed' : readingMode === 'auto' ? 'Stop Auto Readings' : `Auto Readings (${autoTestInterval/60}h)`}
              </Button>
              
              {/* Auto Read Progress */}
              {readingMode === 'auto' && (
                <div className="w-full max-w-[200px] lg:max-w-[220px] xl:max-w-[240px] mt-3" data-testid="auto-test-progress">
                  <div className="bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${autoReadProgress}%` }}
                    />
                  </div>
                  <div className="text-xs lg:text-sm mt-2 text-center font-medium text-gray-600 dark:text-gray-300">
                    {Math.round(autoReadProgress)}% complete
                  </div>
                </div>
              )}

              {/* Auto Restart Status */}
              {isWaitingForRestart && (
                <div className="mt-2 text-sm text-blue-600 dark:text-blue-400 font-medium transition-colors duration-200">
                  ⏳ Waiting {waitTimeRemaining} minutes to restart auto test
                </div>
              )}
              
              {/* Auto Read Completion Message */}
              {autoReadCompleted && readingMode === 'none' && !isWaitingForRestart && (
                <div className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium transition-colors duration-200">
                  ✓ Auto test completed successfully
                </div>
              )}

              {/* Reading Status */}
              {isReading && readingSilo && (
                <div className="mt-2 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 transition-colors duration-200">
                  <div className="w-3 h-3 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  Reading Silo {readingSilo}
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

      {/* Enhanced Alert System */}
      <AlertSystem />
    </div>
  );
};