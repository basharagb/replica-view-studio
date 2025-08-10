import { useEffect, useState, useRef, useCallback } from 'react';
import { LabGroup } from './LabGroup';
import { LabCircle } from './LabCircle';
import { LabNumberSquare } from './LabNumberSquare';
import { LabCylinder } from './LabCylinder';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useLiveSensorData } from '../hooks/useLiveSensorData';
import { Silo, ReadingMode, TooltipPosition } from '../types/silo';
import { temperatureScaleValues } from '../services/siloData';
import EnhancedTemperatureDisplay from './EnhancedTemperatureDisplay';
import EnhancedSensorPanel from './EnhancedSensorPanel';
import AlertSystem from './AlertSystem';

export const LabInterface = () => {
  const {
    topSiloGroups,
    bottomSiloGroups,
    isLoading,
    error,
    refreshData,
    toggleRealTime
  } = useLiveSensorData({
    autoRefresh: true,
    refreshInterval: 30000,
    enableRealTimeUpdates: true
  });

  // State for silo selection and reading
  const [selectedSilo, setSelectedSilo] = useState<number>(112);
  const [selectedTemp, setSelectedTemp] = useState<number>(0.2);
  const [hoveredSilo, setHoveredSilo] = useState<Silo | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ x: 0, y: 0 });
  const [readingMode, setReadingMode] = useState<ReadingMode>('manual');
  const [isReading, setIsReading] = useState<boolean>(false);
  const [readingSilo, setReadingSilo] = useState<number | null>(null);
  const [autoReadProgress, setAutoReadProgress] = useState<number>(0);
  const [autoReadCompleted, setAutoReadCompleted] = useState<boolean>(false);
  const [dataVersion, setDataVersion] = useState<number>(0);
  const [manualTestDuration, setManualTestDuration] = useState<number>(0.05);
  const [autoTestInterval, setAutoTestInterval] = useState<number>(60);
  const [isWaitingForRestart, setIsWaitingForRestart] = useState<boolean>(false);
  const [waitTimeRemaining, setWaitTimeRemaining] = useState<number>(0);
  const autoReadInterval = useRef<NodeJS.Timeout | null>(null);
  const restartWaitInterval = useRef<NodeJS.Timeout | null>(null);
  const idleDetectionInterval = useRef<NodeJS.Timeout | null>(null);
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());
  const [isIdleDetectionActive, setIsIdleDetectionActive] = useState<boolean>(false);

  // Handle silo click
  const handleSiloClick = useCallback((siloNum: number, temp: number) => {
    if (readingMode === 'manual' && !isReading) {
      // Start manual reading
      startManualRead(siloNum, temp);
    } else if (readingMode === 'none') {
      // Normal selection
      setSelectedSilo(siloNum);
      setSelectedTemp(temp);
    }
  }, [readingMode, isReading]);

  // Handle silo hover
  const handleSiloHover = useCallback((siloNum: number, temp: number, event: React.MouseEvent) => {
    setHoveredSilo({ num: siloNum, temp: temp });
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  }, []);

  // Handle silo mouse move (for tooltip positioning)
  const handleSiloMouseMove = useCallback((event: React.MouseEvent) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  }, []);

  // Handle silo leave
  const handleSiloLeave = useCallback(() => {
    setHoveredSilo(null);
  }, []);

  // Start manual reading
  const startManualRead = useCallback((siloNum: number, temp: number) => {
    setIsReading(true);
    setReadingSilo(siloNum);

    // Use manual test duration (in minutes, convert to milliseconds)
    setTimeout(() => {
      setSelectedSilo(siloNum);
      setSelectedTemp(temp);
      setIsReading(false);
      setReadingSilo(null);
    }, manualTestDuration * 60 * 1000); // Convert minutes to milliseconds
  }, [manualTestDuration]);

  // Get silo readings duration based on auto readings interval
  const getSiloTestDuration = useCallback(() => {
    // Convert minutes to milliseconds and calculate per-silo duration
    // 1 hour (60 min) = 24 seconds per silo = 24000ms
    // 2 hours (120 min) = 48 seconds per silo = 48000ms
    // 3 hours (180 min) = 72 seconds per silo = 72000ms
    switch (autoTestInterval) {
      case 60:  // 1 hour
        return 24000; // 24 seconds
      case 120: // 2 hours
        return 48000; // 48 seconds
      case 180: // 3 hours
        return 72000; // 72 seconds
      default:
        return 24000; // Default to 24 seconds
    }
  }, [autoTestInterval]);

  // Start/stop auto reading
  const startAutoRead = useCallback(() => {
    if (readingMode === 'auto' && autoReadInterval.current) {
      // Stop auto read
      clearInterval(autoReadInterval.current);
      autoReadInterval.current = null;
      setIsReading(false);
      setReadingSilo(null);
      setAutoReadProgress(0);
      setReadingMode('none');
      setAutoReadCompleted(false);
      return;
    }

    // Generate new random data for this auto readings
    // regenerateAllSiloData();
    // setDataVersion(prev => prev + 1);
    
    setReadingMode('auto');
    setIsReading(true);
    setAutoReadProgress(0);
    setAutoReadCompleted(false);

    const allSilos = getAllSilos();
    let currentIndex = 0;
    let timeoutCounter = 0;
    const maxTimeout = 100; // Maximum iterations to prevent infinite loop

    // Starting auto readings

    // Validate silo data
    if (!allSilos || allSilos.length === 0) {
      console.error('No silos found - cannot start auto readings');
      setIsReading(false);
      setReadingSilo(null);
      setAutoReadProgress(0);
      setReadingMode('none');
      return;
    }

    // Validate each silo has required properties
    const invalidSilos = allSilos.filter(silo => !silo.num || typeof silo.temp !== 'number');
    if (invalidSilos.length > 0) {
      console.error('Invalid silos found:', invalidSilos);
      setIsReading(false);
      setReadingSilo(null);
      setAutoReadProgress(0);
      setReadingMode('none');
      return;
    }

    const interval = setInterval(() => {
      timeoutCounter++;
      
      // Safety timeout to prevent infinite loops
      if (timeoutCounter > maxTimeout) {
        console.error('Auto readings timeout - forcing completion');
        clearInterval(interval);
        autoReadInterval.current = null;
        setIsReading(false);
        setReadingSilo(null);
        setAutoReadProgress(100);
        setReadingMode('none');
        setAutoReadCompleted(true);
        return;
      }

      if (currentIndex >= allSilos.length) {
        // Auto read complete - start waiting for restart
        clearInterval(interval);
        autoReadInterval.current = null;
        setIsReading(false);
        setReadingSilo(null);
        setAutoReadProgress(100);
        setAutoReadCompleted(true);
        
        // Start waiting period before auto-restart
        startAutoRestartWait();
        return;
      }

      const currentSilo = allSilos[currentIndex];
      // Reading silo progress
      
      setReadingSilo(currentSilo.num);
      setSelectedSilo(currentSilo.num);
      setSelectedTemp(currentSilo.temp);
      setAutoReadProgress(((currentIndex + 1) / allSilos.length) * 100);

      currentIndex++;
    }, getSiloTestDuration()); // Dynamic duration based on auto readings interval

    autoReadInterval.current = interval;
  }, [readingMode, isReading, autoReadCompleted]);

  // Start auto restart wait period
  const startAutoRestartWait = useCallback(() => {
    setIsWaitingForRestart(true);
    setWaitTimeRemaining(autoTestInterval);
    
    // Update countdown every minute
    const countdownInterval = setInterval(() => {
      setWaitTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up - restart auto readings
          clearInterval(countdownInterval);
          setIsWaitingForRestart(false);
          setAutoReadCompleted(false);
          setAutoReadProgress(0);
          // Restart auto readings
          setTimeout(() => startAutoRead(), 100);
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // Update every minute
    
    restartWaitInterval.current = countdownInterval;
  }, [autoTestInterval]);

  // Start idle detection after manual test stops
  const startIdleDetection = useCallback(() => {
    setIsIdleDetectionActive(true);
    setLastActivityTime(Date.now());
    
    // Check for idle every minute
    const idleCheckInterval = setInterval(() => {
      const now = Date.now();
      const idleTime = now - lastActivityTime;
      const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds
      
      if (idleTime >= fifteenMinutes && readingMode === 'none') {
        // Auto start readings after 15 minutes of idle
        clearInterval(idleCheckInterval);
        setIsIdleDetectionActive(false);
        setReadingMode('auto');
        startAutoRead();
      }
    }, 60000); // Check every minute
    
    idleDetectionInterval.current = idleCheckInterval;
  }, [lastActivityTime, readingMode]);

  // Update activity time (call this on user interactions)
  const updateActivityTime = useCallback(() => {
    setLastActivityTime(Date.now());
  }, []);

  // Handle manual read mode toggle
  const handleManualReadMode = useCallback(() => {
    if (readingMode === 'manual') {
      setReadingMode('none');
      // Start idle detection when stopping manual mode
      startIdleDetection();
    } else {
      // Stop any auto read first
      if (autoReadInterval.current) {
        clearInterval(autoReadInterval.current);
        autoReadInterval.current = null;
      }
      // Stop idle detection when starting manual mode
      if (idleDetectionInterval.current) {
        clearInterval(idleDetectionInterval.current);
        idleDetectionInterval.current = null;
        setIsIdleDetectionActive(false);
      }
      setReadingMode('manual');
      setIsReading(false);
      setReadingSilo(null);
      setAutoReadProgress(0);
    }
  }, [readingMode, startIdleDetection]);

  // Check if a silo is currently being read
  const isSiloReading = useCallback((siloNum: number): boolean => {
    return readingSilo === siloNum;
  }, [readingSilo]);

  // Check if a silo is selected
  const isSiloSelected = useCallback((siloNum: number): boolean => {
    return selectedSilo === siloNum;
  }, [selectedSilo]);

  // Get silo by number
  const getSiloByNumber = useCallback((siloNum: number): Silo | null => {
    return findSiloByNumber(siloNum);
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (autoReadInterval.current) {
      clearInterval(autoReadInterval.current);
      autoReadInterval.current = null;
    }
    if (restartWaitInterval.current) {
      clearInterval(restartWaitInterval.current);
      restartWaitInterval.current = null;
    }
  }, []);

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

          {/* Right side with cylinder, input, and controls */}
          <div className="flex flex-col items-center gap-4 2xl:gap-6 3xl:gap-8" data-testid="control-panel">
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
