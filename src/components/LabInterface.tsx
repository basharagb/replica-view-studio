import { useEffect } from 'react';
import { LabGroup } from './LabGroup';
import { LabCircle } from './LabCircle';
import { LabNumberSquare } from './LabNumberSquare';
import { LabCylinder } from './LabCylinder';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useSiloSystem } from '../hooks/useSiloSystem';
import { topSiloGroups, bottomSiloGroups, temperatureScaleValues } from '../services/siloData';

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
    <div className="min-h-screen bg-background p-8" data-testid="lab-interface">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-8">
          {/* Main lab area */}
          <div className="flex-1 space-y-12">
            {/* Top section (1-55) - First 3 rows */}
            <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200" data-testid="top-silo-section">
              <div className="flex gap-6 justify-center">
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
                      onSiloClick={handleSiloClick}
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
            <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200" data-testid="bottom-silo-section">
              <div className="flex gap-6 justify-center">
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

          {/* Right side with cylinder, input, and controls */}
          <div className="flex flex-col items-center gap-4" data-testid="control-panel">
            <LabCylinder
              selectedSilo={selectedSilo}
              readingSilo={readingSilo}
              onSiloClick={handleSiloClick}
              // LabCylinder is completely independent of hover state
              // Only shows readings for selected or reading silo
            />
            <div className="w-20">
              <Input
                value={selectedSilo}
                onChange={handleInputChange}
                className="text-center font-semibold"
                type="number"
                data-testid="silo-input"
              />
            </div>
            
            {/* Manual/Auto Test Controls */}
            <div className="flex flex-col gap-2 items-center mt-4">
              <Button
                variant={readingMode === 'manual' ? 'default' : 'outline'}
                onClick={handleManualReadMode}
                disabled={isReading && readingMode === 'auto'}
                className="w-32"
                data-testid="manual-test-button"
              >
                {readingMode === 'manual' ? 'Stop Manual' : 'Start Manual Test'}
              </Button>
              <Button
                variant={readingMode === 'auto' ? 'default' : 'outline'}
                onClick={startAutoRead}
                disabled={isReading && readingMode === 'manual'}
                className="w-32"
                data-testid="auto-test-button"
              >
                {autoReadCompleted ? 'Auto Test Completed' : readingMode === 'auto' ? 'Stop Auto Test' : 'Start Auto Test'}
              </Button>
              
              {/* Auto Read Progress */}
              {readingMode === 'auto' && (
                <div className="w-48 mt-2" data-testid="auto-test-progress">
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

              {/* Auto Read Completion Message */}
              {autoReadCompleted && readingMode === 'none' && (
                <div className="mt-2 text-sm text-green-600 font-medium">
                  ✓ Auto test completed successfully
                </div>
              )}

              {/* Reading Status */}
              {isReading && readingSilo && (
                <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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
    </div>
  );
};