import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <motion.div 
      className="min-h-screen w-full bg-gradient-to-br from-background via-background to-gray-50 dark:to-gray-900 p-1 sm:p-2 md:p-3 lg:p-4" 
      data-testid="lab-interface"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="w-full h-full max-w-7xl mx-auto">
        <div className="flex flex-col xl:flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-6 items-start justify-center h-full min-h-[calc(100vh-2rem)]">
          {/* Main lab area - Reduced width by 15% */}
          <motion.div 
            className="flex-1 w-full max-w-5xl space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6 h-full"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            {/* Top section (1-55) - Reduced width and improved layout */}
            <motion.div 
              className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-1 sm:p-2 md:p-3 lg:p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.001] backdrop-blur-sm min-h-[32vh] flex items-center w-full max-w-4xl mx-auto" 
              data-testid="top-silo-section" 
              key={`top-${dataVersion}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.002, transition: { duration: 0.2 } }}
            >
              <div className="flex gap-1 justify-center items-center overflow-x-hidden overflow-y-visible pb-2 px-1 h-full w-full">
                {topSiloGroups.map((group, index) => (
                  <div key={index} className="relative transform transition-all duration-300 hover:scale-105 hover:z-10 flex-shrink-0">
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
                    {/* Reduced visual separator between groups */}
                    {index < topSiloGroups.length - 1 && (
                      <div className="absolute -right-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded-full opacity-40"></div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Bottom section (101-195) - Reduced width and improved layout */}
            <motion.div 
              className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-1 sm:p-2 md:p-3 lg:p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.001] backdrop-blur-sm min-h-[42vh] flex items-center w-full max-w-4xl mx-auto" 
              data-testid="bottom-silo-section" 
              key={`bottom-${dataVersion}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.002, transition: { duration: 0.2 } }}
            >
              <div className="flex gap-1 justify-center items-center overflow-x-hidden overflow-y-visible pb-2 px-1 h-full w-full">
                {bottomSiloGroups.map((group, index) => (
                  <div key={index} className="relative transform transition-all duration-300 hover:scale-105 hover:z-10 flex-shrink-0">
                    <div className="flex flex-col items-center gap-1">
                      {/* Row 1: circles */}
                      <div className="flex gap-1 sm:gap-2">
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
                      <div className="flex gap-1 sm:gap-2">
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
                      <div className="flex gap-1 sm:gap-2">
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
                      <div className="flex gap-1 sm:gap-2">
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
                      <div className="flex gap-1 sm:gap-2">
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
                    {/* Reduced visual separator between groups */}
                    {index < bottomSiloGroups.length - 1 && (
                      <div className="absolute -right-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded-full opacity-40"></div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right side panel - Reduced width */}
          <div className="flex flex-col lg:flex-col items-center gap-3 lg:gap-4 xl:gap-6 lg:min-w-[180px] xl:min-w-[200px] 2xl:min-w-[220px] h-full" data-testid="control-panel">
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
      <AnimatePresence>
        {hoveredSilo && (
          <motion.div
            className="temperature-tooltip"
            style={{
              left: tooltipPosition.x + 10,
              top: tooltipPosition.y - 30,
            }}
            data-testid="temperature-tooltip"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            Silo {hoveredSilo.num}: {hoveredSilo.temp.toFixed(1)}°C
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Alert System */}
      <motion.div 
        className="mt-[5px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <AlertSystem />
      </motion.div>
    </motion.div>
  );
};