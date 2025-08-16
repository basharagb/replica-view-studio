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
import CompanyLogosHeader from './CompanyLogosHeader';

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
    getSiloByNumber,
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
    // Get the silo data to extract temperature
    const silo = getSiloByNumber(siloNumber);
    const temperature = silo?.temp || 0;
    
    // Call the original silo click handler for existing functionality
    handleSiloClick(siloNumber, temperature);
    
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
    <div className="min-h-screen bg-background" data-testid="lab-interface">
      {/* Company Logos Header */}
      <CompanyLogosHeader />
      
      <div className="p-4 sm:p-6 lg:p-8">
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
                              onClick={() => handleCombinedSiloClick(circle.num)}
                              onHover={handleSiloHover}
                              onLeave={handleSiloLeave}
                              onMouseMove={handleSiloMouseMove}
                            />
                          ))}
                        </div>
                        
                        {/* Row 2: squares */}
                        <div className="flex gap-0">
                          {(group.row2 || []).slice(0, 5).map((square) => (
                            <LabNumberSquare
                              key={`row2-${square.num}`}
                              number={square.num}
                              temp={square.temp}
                              isSelected={selectedSilo === square.num}
                              isReading={readingSilo === square.num}
                              onClick={() => handleCombinedSiloClick(square.num)}
                              onHover={handleSiloHover}
                              onLeave={handleSiloLeave}
                              onMouseMove={handleSiloMouseMove}
                            />
                          ))}
                        </div>

                        {/* Row 3: squares */}
                        <div className="flex gap-0">
                          {(group.row3 || []).slice(0, 5).map((square) => (
                            <LabNumberSquare
                              key={`row3-${square.num}`}
                              number={square.num}
                              temp={square.temp}
                              isSelected={selectedSilo === square.num}
                              isReading={readingSilo === square.num}
                              onClick={() => handleCombinedSiloClick(square.num)}
                              onHover={handleSiloHover}
                              onLeave={handleSiloLeave}
                              onMouseMove={handleSiloMouseMove}
                            />
                          ))}
                        </div>

                        {/* Row 4: squares */}
                        <div className="flex gap-0">
                          {(group.row4 || []).slice(0, 5).map((square) => (
                            <LabNumberSquare
                              key={`row4-${square.num}`}
                              number={square.num}
                              temp={square.temp}
                              isSelected={selectedSilo === square.num}
                              isReading={readingSilo === square.num}
                              onClick={() => handleCombinedSiloClick(square.num)}
                              onHover={handleSiloHover}
                              onLeave={handleSiloLeave}
                              onMouseMove={handleSiloMouseMove}
                            />
                          ))}
                        </div>

                        {/* Row 5: squares */}
                        <div className="flex gap-0">
                          {(group.row5 || []).slice(0, 5).map((square) => (
                            <LabNumberSquare
                              key={`row5-${square.num}`}
                              number={square.num}
                              temp={square.temp}
                              isSelected={selectedSilo === square.num}
                              isReading={readingSilo === square.num}
                              onClick={() => handleCombinedSiloClick(square.num)}
                              onHover={handleSiloHover}
                              onLeave={handleSiloLeave}
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

              {/* Enhanced Alert System and Reset Buttons */}
              <div className="flex items-center gap-4 justify-between">
                <AlertSystem />
                <div className="text-sm text-muted-foreground">
                  System reset controls moved to Settings → System tab
                </div>
              </div>
            </div>

            {/* Right sidebar with controls and displays */}
            <div className="w-80 2xl:w-96 3xl:w-112 space-y-6 2xl:space-y-8 3xl:space-y-10">
              {/* Temperature Scale */}
              <div className="bg-white p-4 2xl:p-6 3xl:p-8 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Temperature Scale</h3>
                <div className="space-y-2">
                  {temperatureScaleValues.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enhanced Temperature Display */}
              <EnhancedTemperatureDisplay
                selectedSilo={selectedSilo}
                selectedTemp={selectedTemp}
              />

              {/* Silo Selection Input */}
              <div className="bg-white p-4 2xl:p-6 3xl:p-8 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Select Silo</h3>
                <Input
                  type="number"
                  placeholder="Enter silo number"
                  value={selectedSilo || ''}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>

              {/* Silo Sensors Display */}
              <div className="bg-white p-4 2xl:p-6 3xl:p-8 rounded-lg border shadow-sm" style={{ height: '400px', minHeight: '400px' }}>
                <h3 className="text-lg font-semibold mb-4">Silo Sensors</h3>
                <div className="flex justify-center" style={{ height: '100%' }}>
                  <LabCylinder
                    selectedSilo={selectedSilo}
                    selectedTemp={selectedTemp}
                    isReading={isReading}
                    readingSilo={readingSilo}
                  />
                </div>
              </div>

              {/* Grain Level Display */}
              <div className="bg-white p-4 2xl:p-6 3xl:p-8 rounded-lg border shadow-sm" style={{ height: '400px', minHeight: '400px' }}>
                <h3 className="text-lg font-semibold mb-4">Grain Level</h3>
                <div className="flex justify-center" style={{ height: '100%' }}>
                  <GrainLevelCylinder
                    selectedSilo={selectedSilo}
                    isReading={isReading}
                    readingSilo={readingSilo}
                  />
                </div>
              </div>

              {/* Test Controls */}
              <div className="bg-gradient-to-br from-white to-blue-50 p-4 2xl:p-6 3xl:p-8 rounded-lg border shadow-lg hover:shadow-xl transition-all duration-300">
                <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Test Controls</h3>
                
                {/* Manual Test Button */}
                <div className="space-y-4">
                  <Button
                    onClick={() => handleManualReadMode(manualTestDuration)}
                    disabled={isReading}
                    className="w-full transform transition-all duration-300 hover:scale-105 hover:shadow-lg 
                               bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
                               animate-pulse hover:animate-none"
                    variant={readingMode === 'manual' ? 'default' : 'outline'}
                  >
                    <span className="flex items-center gap-2">
                      {readingMode === 'manual' ? (
                        <>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                          Manual Test Active
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          Start Manual Test
                        </>
                      )}
                    </span>
                  </Button>

                  {/* Auto Test Button */}
                  <Button
                    onClick={startAutoRead}
                    disabled={isReading && readingMode === 'manual'}
                    className="w-full transform transition-all duration-300 hover:scale-105 hover:shadow-lg
                               bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700
                               animate-pulse hover:animate-none"
                    variant={readingMode === 'auto' ? 'default' : 'outline'}
                  >
                    <span className="flex items-center gap-2">
                      {readingMode === 'auto' ? (
                        <>
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
                          Stop Auto Test
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          Start Auto Test
                        </>
                      )}
                    </span>
                  </Button>

                  {/* Progress bar for auto test */}
                  {readingMode === 'auto' && (
                    <div className="w-48 2xl:w-56 3xl:w-64 mt-2" data-testid="auto-test-progress">
                      <div className="bg-gradient-to-r from-gray-200 to-gray-300 h-4 rounded-full shadow-inner overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 h-4 rounded-full transition-all duration-500 ease-out
                                     shadow-lg animate-pulse relative overflow-hidden"
                          style={{ width: `${autoReadProgress}%` }}
                        >
                          {/* Animated shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 
                                          animate-pulse transform -skew-x-12"></div>
                        </div>
                      </div>
                      <div className="text-xs mt-2 text-center font-medium bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        <span className="animate-pulse">{Math.round(autoReadProgress)}% complete</span>
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
        </div>
      </div>
    </div>
  );
};
