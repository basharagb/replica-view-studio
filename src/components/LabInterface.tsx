import { useEffect } from 'react';
import { LabGroup } from './LabGroup';
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
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-8">
          {/* Main lab area */}
          <div className="flex-1 space-y-0">
            {/* Top section */}
            <div className="flex gap-0 justify-center">
              {topSiloGroups.map((group, index) => (
                <LabGroup 
                  key={index} 
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
              ))}
            </div>

            {/* Bottom section */}
            <div className="space-y-0">
              <div className="flex gap-0 justify-center">
                {bottomSiloGroups.map((group, index) => (
                  <LabGroup 
                    key={index} 
                    circles={[
                      ...(group.row1 || []),
                      ...(group.row3 || [])
                    ]}
                    squares={group.row2?.map(silo => silo.num) || []}
                    selectedSilo={selectedSilo}
                    readingSilo={readingSilo}
                    hoveredSilo={hoveredSilo}
                    onSiloClick={handleSiloClick}
                    onSiloHover={handleSiloHover}
                    onSiloLeave={handleSiloLeave}
                    onSiloMouseMove={handleSiloMouseMove}
                  />
                ))}
              </div>
              
              {/* Bottom row with fewer circles */}
              <div className="flex gap-0 justify-center">
                {bottomRowData.map((group, index) => (
                  <div key={index} className="relative flex flex-col items-center gap-0">
                    <div className="flex gap-0 px-2">
                      {group.squares.map((num, squareIndex) => (
                        <div 
                          key={squareIndex} 
                          className={`
                            w-6 h-6
                            temp-beige
                            border
                            border-gray-300
                            flex
                            items-center
                            justify-center
                            text-xs
                            font-medium
                            text-lab-text
                            cursor-pointer
                            transition-all
                            duration-200
                            user-select-none
                            rounded-sm
                            ${selectedSilo === num ? 'silo-selected' : ''}
                            ${readingSilo === num ? 'silo-reading' : ''}
                            ${hoveredSilo?.num === num ? 'silo-hover' : ''}
                          `}
                          onClick={() => handleSiloClick(num, 0)}
                          onMouseEnter={(e) => handleSiloHover(num, 0, e)}
                          onMouseLeave={handleSiloLeave}
                          onMouseMove={handleSiloMouseMove}
                        >
                          {readingSilo === num ? (
                            <div className="reading-spinner w-3 h-3 border border-white border-t-transparent"></div>
                          ) : (
                            num
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-0">
                      {group.circles.map((circle, circleIndex) => (
                        <div 
                          key={circleIndex} 
                          className={`
                            w-12 h-12
                            temp-beige
                            rounded-full
                            flex
                            items-center
                            justify-center
                            font-semibold
                            text-lab-text
                            border-2
                            border-gray-300
                            shadow-sm
                            cursor-pointer
                            transition-all
                            duration-200
                            user-select-none
                            text-sm
                            ${selectedSilo === circle.num ? 'silo-selected' : ''}
                            ${readingSilo === circle.num ? 'silo-reading' : ''}
                            ${hoveredSilo?.num === circle.num ? 'silo-hover' : ''}
                          `}
                          onClick={() => handleSiloClick(circle.num, circle.temp)}
                          onMouseEnter={(e) => handleSiloHover(circle.num, circle.temp, e)}
                          onMouseLeave={handleSiloLeave}
                          onMouseMove={handleSiloMouseMove}
                        >
                          {readingSilo === circle.num ? (
                            <div className="reading-spinner"></div>
                          ) : (
                            circle.num
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side with cylinder, input, and controls */}
          <div className="flex flex-col items-center gap-4">
            <LabCylinder
              selectedSilo={selectedSilo}
              readingSilo={readingSilo}
              hoveredSilo={hoveredSilo}
              onSiloClick={handleSiloClick}
              onSiloHover={handleSiloHover}
              onSiloLeave={handleSiloLeave}
              onSiloMouseMove={handleSiloMouseMove}
            />
            <div className="w-20">
              <Input
                value={selectedSilo}
                onChange={handleInputChange}
                className="text-center font-semibold"
                type="number"
              />
            </div>
            
            {/* Manual/Auto Test Controls */}
            <div className="flex flex-col gap-2 items-center mt-4">
              <Button
                variant={readingMode === 'manual' ? 'default' : 'outline'}
                onClick={handleManualReadMode}
                disabled={isReading && readingMode === 'auto'}
                className="w-32"
              >
                {readingMode === 'manual' ? 'Stop Manual' : 'Start Manual Test'}
              </Button>
              <Button
                variant={readingMode === 'auto' ? 'default' : 'outline'}
                onClick={startAutoRead}
                disabled={isReading && readingMode === 'manual'}
                className="w-32"
              >
                {readingMode === 'auto' ? 'Stop Auto Test' : 'Start Auto Test'}
              </Button>
              
              {/* Auto Read Progress */}
              {readingMode === 'auto' && (
                <div className="w-48 mt-2">
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
        >
          Silo {hoveredSilo.num}: {hoveredSilo.temp.toFixed(1)}°C
        </div>
      )}
    </div>
  );
};