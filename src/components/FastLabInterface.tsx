import { useEffect } from 'react';
import { LabGroup } from './LabGroup';
import { LabCircle } from './LabCircle';
import { LabNumberSquare } from './LabNumberSquare';
import { LabCylinder } from './LabCylinder';
import { GrainLevelCylinder } from './GrainLevelCylinder';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useFastSiloSystem } from '../hooks/useFastSiloSystem';
import { topSiloGroups, bottomSiloGroups } from '../services/siloData';
import { Zap, AlertTriangle } from 'lucide-react';

/**
 * Fast Lab Interface - For IT Team Testing
 * 
 * This is a simplified version of LabInterface that uses 2-second intervals
 * instead of 24 seconds for rapid testing of all silos.
 * 
 * Features:
 * - 2-second interval per silo (instead of 24 seconds)
 * - Estimated ~5 minutes to test all 150 silos
 * - No daily scheduler (this is for manual IT testing only)
 * - Clear "FAST MODE" indicator
 */

interface FastLabInterfaceProps {
  onSiloClick?: (siloNumber: number) => void;
}

export const FastLabInterface = ({ onSiloClick }: FastLabInterfaceProps) => {
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
    disconnectedSilos,
    retryCount,
    isRetryPhase,
    maxRetries,
    handleSiloClick,
    handleSiloHover,
    handleSiloMouseMove,
    handleSiloLeave,
    startAutoRead,
    handleManualReadMode,
    setSelectedSilo,
    getSiloByNumber,
    cleanup,
  } = useFastSiloSystem();

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

  // Combined click handler
  const handleCombinedSiloClick = (siloNumber: number) => {
    const silo = getSiloByNumber(siloNumber);
    const temperature = silo?.temp || 0;
    handleSiloClick(siloNumber, temperature);
    
    if (onSiloClick) {
      onSiloClick(siloNumber);
    }
  };

  return (
    <div className="min-h-screen bg-background p-3" data-testid="fast-lab-interface">
      <div className="max-w-7xl mx-auto">
        {/* Fast Mode Warning Banner */}
        <div className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-500 rounded-lg">
          <div className="flex items-center gap-3">
            <Zap className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            <div>
              <h2 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                ⚡ FAST LIVE READING MODE
                <span className="text-sm font-normal bg-yellow-600 text-white px-2 py-0.5 rounded">IT TEAM ONLY</span>
              </h2>
              <p className="text-yellow-700 dark:text-yellow-300">
                2-second interval per silo • Estimated ~5 minutes for all silos • For testing purposes only
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Main lab area */}
          <div className="flex-1 space-y-3">
            {/* Top section (1-55) */}
            <div className="bg-gray-50 p-3 rounded-lg border-2 border-gray-200" data-testid="top-silo-section" key={`top-${dataVersion}`}>
              <div className="flex gap-3 justify-center">
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
                    {index < topSiloGroups.length - 1 && (
                      <div className="absolute -right-3 top-0 bottom-0 w-px bg-gray-400"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom section (101-195) */}
            <div className="bg-gray-50 p-3 rounded-lg border-2 border-gray-200" data-testid="bottom-silo-section" key={`bottom-${dataVersion}`}>
              <div className="flex gap-3 justify-center">
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
                            onClick={handleCombinedSiloClick}
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
                            onClick={handleCombinedSiloClick}
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
                            onClick={handleCombinedSiloClick}
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
                            onClick={handleCombinedSiloClick}
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
                            onClick={handleCombinedSiloClick}
                            onMouseEnter={handleSiloHover}
                            onMouseLeave={handleSiloLeave}
                            onMouseMove={handleSiloMouseMove}
                          />
                        ))}
                      </div>
                    </div>
                    {index < bottomSiloGroups.length - 1 && (
                      <div className="absolute -right-3 top-0 bottom-0 w-px bg-gray-400"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex flex-col items-center gap-3" data-testid="control-panel">
            {/* Cylinder Components */}
            <div className="flex items-stretch justify-center gap-2">
              <LabCylinder
                key={`cylinder-${dataVersion}`}
                selectedSilo={selectedSilo}
                readingSilo={readingSilo}
                onSiloClick={handleCombinedSiloClick}
              />
              <GrainLevelCylinder
                key={`grain-cylinder-${dataVersion}`}
                selectedSilo={selectedSilo}
                readingSilo={readingSilo}
                onSiloClick={handleCombinedSiloClick}
                isAutoTestRunning={isReading}
              />
            </div>
            
            {/* Silo Input */}
            <div className="w-20 2xl:w-24 3xl:w-28">
              <Input
                value={selectedSilo}
                onChange={handleInputChange}
                className="text-center font-semibold"
                type="number"
                data-testid="silo-input"
              />
            </div>
            
            {/* Fast Test Controls */}
            <div className="flex flex-col gap-2 items-center mt-2">
              <Button
                variant={readingMode === 'manual' ? 'default' : 'outline'}
                onClick={handleManualReadMode}
                disabled={isReading && readingMode === 'auto'}
                className="w-40"
                data-testid="manual-test-button"
              >
                {readingMode === 'manual' ? 'Stop Manual' : 'Manual Test (2s)'}
              </Button>
              
              <Button
                variant={readingMode === 'auto' ? 'default' : 'outline'}
                onClick={startAutoRead}
                disabled={isReading && readingMode === 'manual'}
                className="w-40 bg-yellow-500 hover:bg-yellow-600 text-black"
                data-testid="fast-auto-test-button"
              >
                <Zap className="h-4 w-4 mr-1" />
                {autoReadCompleted ? 'Fast Test Done' : readingMode === 'auto' ? 'Stop Fast Test' : '⚡ Fast Auto Test'}
              </Button>
              
              {/* Fast Auto Read Progress */}
              {readingMode === 'auto' && (
                <div className="w-48 2xl:w-56 3xl:w-64 mt-2" data-testid="fast-auto-test-progress">
                  <div className="bg-gray-200 h-4 rounded">
                    <div
                      className={`h-4 rounded transition-all duration-150 ${
                        isRetryPhase ? 'bg-orange-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${Math.min(autoReadProgress, 100)}%` }}
                    />
                  </div>
                  <div className="text-sm mt-1 text-center font-medium">
                    {isRetryPhase ? (
                      <div>
                        <div className="text-orange-600">
                          🔄 Fast Retry {retryCount}/{maxRetries}
                        </div>
                        <div className="text-gray-600 text-xs">
                          {disconnectedSilos.length} disconnected
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className="text-yellow-700">{Math.round(autoReadProgress)}%</span>
                        {' '}complete
                        {disconnectedSilos.length > 0 && (
                          <span className="text-orange-600 ml-1">
                            ({disconnectedSilos.length} disconnected)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Completion Message */}
              {autoReadCompleted && readingMode === 'none' && (
                <div className="mt-2 text-sm text-green-600 font-medium">
                  ✓ Fast test completed!
                </div>
              )}

              {/* Reading Status */}
              {isReading && readingSilo && (
                <div className="mt-2 flex items-center gap-2 text-sm text-yellow-700 font-medium">
                  <div className="w-3 h-3 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                  ⚡ Testing Silo {readingSilo}
                </div>
              )}
            </div>

            {/* Fast Mode Info */}
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-400 max-w-[200px]">
              <div className="flex items-center gap-1 mb-1">
                <AlertTriangle className="h-3 w-3" />
                <span className="font-semibold">Fast Mode Info</span>
              </div>
              <ul className="space-y-1">
                <li>• 2 sec per silo</li>
                <li>• ~5 min total</li>
                <li>• 3 retry cycles</li>
                <li>• For IT testing only</li>
              </ul>
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
