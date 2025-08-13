import { useEffect } from 'react';
import { LabGroup } from './LabGroup';
import { LabCircle } from './LabCircle';
import { LabNumberSquare } from './LabNumberSquare';
import { LabCylinder } from './LabCylinder';
import { GrainLevelCylinder } from './GrainLevelCylinder';
import { Input } from './ui/input';
import { useSiloSystem } from '../hooks/useSiloSystem';
import { topSiloGroups, bottomSiloGroups } from '../services/siloData';
import EnhancedTemperatureDisplay from './EnhancedTemperatureDisplay';
import AlertSystem from './AlertSystem';

interface MaintenanceLabInterfaceProps {
  onSiloClick?: (siloNumber: number) => void;
}

export const MaintenanceLabInterface = ({ onSiloClick }: MaintenanceLabInterfaceProps) => {
  const {
    selectedSilo,
    selectedTemp,
    hoveredSilo,
    tooltipPosition,
    readingSilo,
    dataVersion,
    handleSiloClick,
    handleSiloHover,
    handleSiloMouseMove,
    handleSiloLeave,
    setSelectedSilo,
    getSiloByNumber,
    cleanup
  } = useSiloSystem();

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setSelectedSilo(value);
  };

  const handleCombinedSiloClick = (siloNumber: number) => {
    handleSiloClick(siloNumber, selectedTemp);
    if (onSiloClick) {
      onSiloClick(siloNumber);
    }
  };

  const selectedSiloData = getSiloByNumber(selectedSilo);

  return (
    <div className="min-h-screen bg-background p-8" data-testid="lab-interface">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-8 2xl:gap-12 3xl:gap-16">
          {/* Main lab area */}
          <div className="flex-1 space-y-12 2xl:space-y-16 3xl:space-y-20">
            {/* Top section */}
            <div
              className="bg-gray-50 p-6 2xl:p-8 3xl:p-10 rounded-lg border-2 border-gray-200"
              data-testid="top-silo-section"
              key={`top-${dataVersion}`}
            >
              <div className="flex gap-6 2xl:gap-8 3xl:gap-10 justify-center">
                {topSiloGroups.map((group, index) => (
                  <div key={index} className="relative">
                    <LabGroup
                      circles={[
                        ...(group.topRow || []),
                        ...(group.bottomRow || [])
                      ]}
                      squares={group.middleRow?.map(silo => silo.num) || []}
                      onSiloClick={handleCombinedSiloClick}
                      onSiloHover={handleSiloHover}
                      onSiloMouseMove={handleSiloMouseMove}
                      onSiloLeave={handleSiloLeave}
                      selectedSilo={selectedSilo}
                      hoveredSilo={hoveredSilo}
                      readingSilo={readingSilo}
                    />
                    {index < topSiloGroups.length - 1 && (
                      <div className="absolute -right-3 top-0 bottom-0 w-px bg-gray-400"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom section */}
            <div
              className="bg-gray-50 p-6 2xl:p-8 3xl:p-10 rounded-lg border-2 border-gray-200"
              data-testid="bottom-silo-section"
              key={`bottom-${dataVersion}`}
            >
              <div className="flex gap-6 2xl:gap-8 3xl:gap-10 justify-center">
                {bottomSiloGroups.map((group, index) => (
                  <div key={index} className="relative">
                    <div className="flex flex-col gap-0">
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
                      
                      {/* Row 2: squares - CENTERED */}
                      <div className="flex gap-0 justify-center"> {/* ⬅ CHANGE */}
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
                      
                      {/* Row 4: squares - CENTERED */}
                      <div className="flex gap-0 justify-center"> {/* ⬅ CHANGE */}
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

          {/* Right control panel */}
          <div
            className="flex flex-col items-center gap-4 2xl:gap-6 3xl:gap-8"
            data-testid="control-panel"
          >
            <div className="flex items-start" style={{ height: '352px', minHeight: '352px' }}>
              <div style={{ marginLeft: '-3px' }}>
                <LabCylinder
                  key={`cylinder-${dataVersion}`}
                  selectedSilo={selectedSilo}
                  readingSilo={readingSilo}
                  onSiloClick={handleCombinedSiloClick}
                />
              </div>
              <GrainLevelCylinder
                key={`grain-cylinder-${dataVersion}`}
                selectedSilo={selectedSilo}
                readingSilo={readingSilo}
                onSiloClick={handleCombinedSiloClick}
                isAutoTestRunning={false}
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

            {selectedSiloData && (
              <EnhancedTemperatureDisplay
                temperature={selectedSiloData.temp}
                siloNumber={selectedSiloData.num}
                className="mb-4"
              />
            )}

            <AlertSystem />
          </div>
        </div>
      </div>
    </div>
  );
};
