// Updated LabInterface.jsx matching screenshot layout
import { useEffect } from 'react';
import { LabGroup } from './LabGroup';
import { LabCircle } from './LabCircle';
import { LabNumberSquare } from './LabNumberSquare';
import { LabCylinder } from './LabCylinder';
import { Input } from './ui/input';
import { Button } from './ui/button'; 
import { useSiloSystem } from '../hooks/useSiloSystem';
import { topSiloGroups, bottomSiloGroups } from '../services/siloData';
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

  useEffect(() => cleanup, [cleanup]);

  const handleInputChange = (event) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value)) {
      setSelectedSilo(value);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-black p-2" data-testid="lab-interface">
      <div className="flex flex-col lg:flex-row gap-3 mt-12">
        {/* Left side: top and bottom silo groups */}
        <div className="flex-1 space-y-3 min-w-0">
          {/* Top silo group */}
          <div className="rounded-lg border p-2 bg-white shadow overflow-hidden">
            <div className="flex justify-center flex-wrap gap-1 min-h-0">
              {topSiloGroups.map((group, index) => (
                <LabGroup
                  key={`top-${index}`}
                  circles={[...(group.topRow || []), ...(group.bottomRow || [])]}
                  squares={group.middleRow?.map(s => s.num) || []}
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
          </div>

          {/* Bottom silo group */}
          <div className="rounded-lg border p-2 bg-white shadow overflow-hidden">
            <div className="flex justify-center flex-wrap gap-1 min-h-0">
              {bottomSiloGroups.map((group, index) => (
                <div key={`bottom-${index}`} className="flex flex-col items-center gap-0 mx-1 my-1">
                  <div className="flex gap-0">
                    {(group.row1 || []).slice(0, 3).map(c => (
                      <LabCircle key={c.num} number={c.num} temp={c.temp} isSelected={selectedSilo === c.num} isReading={readingSilo === c.num} isHovered={hoveredSilo?.num === c.num} onClick={handleSiloClick} onMouseEnter={handleSiloHover} onMouseLeave={handleSiloLeave} onMouseMove={handleSiloMouseMove} />
                    ))}
                  </div>
                  <div className="flex gap-0">
                    {(group.row2 || []).slice(0, 5).map(s => (
                      <LabNumberSquare key={s.num} number={s.num} isSelected={selectedSilo === s.num} isReading={readingSilo === s.num} isHovered={hoveredSilo?.num === s.num} onClick={handleSiloClick} onMouseEnter={handleSiloHover} onMouseLeave={handleSiloLeave} onMouseMove={handleSiloMouseMove} />
                    ))}
                  </div>
                  <div className="flex gap-0">
                    {(group.row3 || []).slice(0, 3).map(c => (
                      <LabCircle key={c.num} number={c.num} temp={c.temp} isSelected={selectedSilo === c.num} isReading={readingSilo === c.num} isHovered={hoveredSilo?.num === c.num} onClick={handleSiloClick} onMouseEnter={handleSiloHover} onMouseLeave={handleSiloLeave} onMouseMove={handleSiloMouseMove} />
                    ))}
                  </div>
                  <div className="flex gap-0">
                    {(group.row4 || []).slice(0, 5).map(s => (
                      <LabNumberSquare key={s.num} number={s.num} isSelected={selectedSilo === s.num} isReading={readingSilo === s.num} isHovered={hoveredSilo?.num === s.num} onClick={handleSiloClick} onMouseEnter={handleSiloHover} onMouseLeave={handleSiloLeave} onMouseMove={handleSiloMouseMove} />
                    ))}
                  </div>
                  <div className="flex gap-0">
                    {(group.row5 || []).slice(0, 3).map(c => (
                      <LabCircle key={c.num} number={c.num} temp={c.temp} isSelected={selectedSilo === c.num} isReading={readingSilo === c.num} isHovered={hoveredSilo?.num === c.num} onClick={handleSiloClick} onMouseEnter={handleSiloHover} onMouseLeave={handleSiloLeave} onMouseMove={handleSiloMouseMove} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side: cylinder + input + buttons */}
        <div className="flex flex-col items-center gap-2 w-full lg:w-[220px] lg:min-w-[220px] lg:max-w-[220px] lg:flex-shrink-0 -mt-4">
          <LabCylinder
            selectedSilo={selectedSilo}
            readingSilo={readingSilo}
            onSiloClick={handleSiloClick}
          />

          <Input
            type="number"
            value={selectedSilo}
            onChange={handleInputChange}
            className="w-24 text-center text-lg font-semibold border-2"
          />

          <Button onClick={handleManualReadMode} className="w-full">
            {readingMode === 'manual' ? 'Stop Manual Test' : 'Start Manual Test'}
          </Button>

          <Button onClick={startAutoRead} className="w-full">
            {readingMode === 'auto' ? 'Stop Auto Test' : 'Start Auto Test'}
          </Button>

          {readingMode === 'auto' && (
            <div className="text-sm text-gray-600 text-center">
              {Math.round(autoReadProgress)}% Complete
              <div className="w-full h-2 bg-gray-200 mt-1 rounded">
                <div className="h-full bg-blue-500 rounded" style={{ width: `${autoReadProgress}%` }}></div>
              </div>
            </div>
          )}

          {isWaitingForRestart && (
            <div className="text-sm text-blue-600">Waiting {waitTimeRemaining} min</div>
          )}

          {autoReadCompleted && readingMode === 'none' && !isWaitingForRestart && (
            <div className="text-sm text-green-600">Auto test completed</div>
          )}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredSilo && (
        <div
          className="fixed px-2 py-1 bg-black text-white text-sm rounded"
          style={{ left: tooltipPosition.x + 10, top: tooltipPosition.y - 30 }}
        >
          Silo {hoveredSilo.num}: {hoveredSilo.temp.toFixed(1)}°C
        </div>
      )}

      <AlertSystem />
    </div>
  );
};