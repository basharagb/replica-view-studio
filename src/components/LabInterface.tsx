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
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-gray-50 dark:to-gray-900 p-1 sm:p-2 md:p-3 lg:p-4" data-testid="lab-interface">
      <div className="w-full h-full max-w-none">
        <div className="flex flex-col xl:flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-6 items-start justify-start h-full min-h-[calc(100vh-2rem)]">
          {/* Main lab area - Enhanced for full screen */}
          <div className="flex-1 w-full max-w-full space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6 h-full">
            {/* Top section (1-55) - Enhanced size */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.005] backdrop-blur-sm min-h-[35vh] flex items-center" data-testid="top-silo-section" key={`top-${dataVersion}`}>
              <div className="flex gap-1 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-5 justify-center items-center overflow-x-auto overflow-y-visible pb-4 px-2 h-full min-w-0">
                {topSiloGroups.map((group, index) => (
                  <div key={index} className="relative transform transition-all duration-300 hover:scale-110 hover:z-10">
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
                    {/* Enhanced visual separator between groups */}
                    {index < topSiloGroups.length - 1 && (
                      <div className="absolute -right-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded-full opacity-60"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom section (101-195) - Enhanced size */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.005] backdrop-blur-sm min-h-[45vh] flex items-center" data-testid="bottom-silo-section" key={`bottom-${dataVersion}`}>
              <div className="flex gap-1 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-5 justify-center items-center overflow-x-auto overflow-y-visible pb-4 px-2 h-full min-w-0">
                {bottomSiloGroups.map((group, index) => (
                  <div key={index} className="relative transform transition-all duration-300 hover:scale-110 hover:z-10">
                    <div className="flex flex-col items-center gap-1 sm:gap-2">
                      {/* Row 1: circles */}
                      <div className="flex gap-1 sm:gap-2 md:gap-3">
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
                      <div className="flex gap-1 sm:gap-2 md:gap-3">
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
                      <div className="flex gap-1 sm:gap-2 md:gap-3">
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
                      <div className="flex gap-1 sm:gap-2 md:gap-3">
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
                      <div className="flex gap-1 sm:gap-2 md:gap-3">
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
                    {/* Enhanced visual separator between groups */}
                    {index < bottomSiloGroups.length - 1 && (
                      <div className="absolute -right-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded-full opacity-60"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side panel - Enhanced for full screen */}
          <div className="flex flex-col lg:flex-col items-center gap-3 lg:gap-4 xl:gap-6 lg:min-w-[220px] xl:min-w-[260px] 2xl:min-w-[280px] h-full" data-testid="control-panel">
            <LabCylinder
              key={`cylinder-${dataVersion}`}
              selectedSilo={selectedSilo}
              readingSilo={readingSilo}
              onSiloClick={handleSiloClick}
              // LabCylinder is completely independent of hover state
              // Only shows readings for selected or reading silo
            />
            <div className="w-24 lg:w-28 xl:w-32">
              <Input
                value={selectedSilo}
                onChange={handleInputChange}
                className="text-center font-semibold text-lg lg:text-xl border-2 focus:border-blue-500 transition-all duration-200"
                type="number"
                data-testid="silo-input"
              />
            </div>
            
            {/* Manual/Auto Test Controls - Enhanced spacing */}
            <div className="flex flex-col gap-4 items-center mt-6 lg:mt-8 w-full flex-1 justify-start">
              <Button
                variant={readingMode === 'manual' ? 'default' : 'outline'}
                onClick={handleManualReadMode}
                disabled={isReading && readingMode === 'auto'}
                className="w-full max-w-[220px] lg:max-w-[240px] xl:max-w-[260px] text-sm lg:text-base font-medium transition-all duration-300 hover:scale-110 hover:shadow-lg py-3 lg:py-4"
                data-testid="manual-test-button"
              >
                {readingMode === 'manual' ? 'Stop Manual Readings' : `Manual Readings (${manualTestDuration}min)`}
              </Button>
              <Button
                variant={readingMode === 'auto' ? 'default' : 'outline'}
                onClick={startAutoRead}
                disabled={(isReading && readingMode === 'manual') || isWaitingForRestart}
                className="w-full max-w-[220px] lg:max-w-[240px] xl:max-w-[260px] text-sm lg:text-base font-medium transition-all duration-300 hover:scale-110 hover:shadow-lg py-3 lg:py-4"
                data-testid="auto-test-button"
              >
                {isWaitingForRestart ? 'Waiting to Restart' : autoReadCompleted ? 'Auto Readings Completed' : readingMode === 'auto' ? 'Stop Auto Readings' : `Auto Readings (${autoTestInterval/60}h)`}
              </Button>
              
              {/* Auto Read Progress - Enhanced */}
              {readingMode === 'auto' && (
                <div className="w-full max-w-[220px] lg:max-w-[240px] xl:max-w-[260px] mt-4" data-testid="auto-test-progress">
                  <div className="bg-gray-200 dark:bg-gray-700 h-4 lg:h-5 rounded-full overflow-hidden shadow-inner border border-gray-300 dark:border-gray-600">
                    <div
                      className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                      style={{ width: `${autoReadProgress}%` }}
                    />
                  </div>
                  <div className="text-sm lg:text-base mt-3 text-center font-semibold text-gray-700 dark:text-gray-200 tracking-wide">
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