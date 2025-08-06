import { useState, useRef, useCallback } from 'react';
import { Silo, SiloSystemState, ReadingMode, TooltipPosition } from '../types/silo';
import { getAllSilos, findSiloByNumber, regenerateAllSiloData } from '../services/siloData';

export const useSiloSystem = () => {
  // Core state
  const [selectedSilo, setSelectedSilo] = useState<number>(112);
  const [selectedTemp, setSelectedTemp] = useState<number>(0.2);
  const [hoveredSilo, setHoveredSilo] = useState<Silo | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ x: 0, y: 0 });

  // Reading control states
  const [readingMode, setReadingMode] = useState<ReadingMode>('manual');
  const [isReading, setIsReading] = useState<boolean>(false);
  const [readingSilo, setReadingSilo] = useState<number | null>(null);
  const [autoReadProgress, setAutoReadProgress] = useState<number>(0);
  const [autoReadCompleted, setAutoReadCompleted] = useState<boolean>(false);
  const [dataVersion, setDataVersion] = useState<number>(0);
  const [manualTestDuration, setManualTestDuration] = useState<number>(0.083); // 5 seconds per silo (5/60 = 0.083 minutes)
  const [autoTestInterval, setAutoTestInterval] = useState<number>(60); // 1 hour default
  const [isWaitingForRestart, setIsWaitingForRestart] = useState<boolean>(false);
  const [waitTimeRemaining, setWaitTimeRemaining] = useState<number>(0);
  const autoReadInterval = useRef<NodeJS.Timeout | null>(null);
  const restartWaitInterval = useRef<NodeJS.Timeout | null>(null);

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

  // Get silo test duration based on auto test interval
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

    // Generate new random data for this auto test
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

    // Starting auto test

    // Validate silo data
    if (!allSilos || allSilos.length === 0) {
      console.error('No silos found - cannot start auto test');
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
        console.error('Auto test timeout - forcing completion');
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
    }, getSiloTestDuration()); // Dynamic duration based on auto test interval

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
          // Time's up - restart auto test
          clearInterval(countdownInterval);
          setIsWaitingForRestart(false);
          setAutoReadCompleted(false);
          setAutoReadProgress(0);
          // Restart auto test
          setTimeout(() => startAutoRead(), 100);
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // Update every minute
    
    restartWaitInterval.current = countdownInterval;
  }, [autoTestInterval]);

  // Handle manual read mode toggle
  const handleManualReadMode = useCallback(() => {
    if (readingMode === 'manual') {
      setReadingMode('none');
    } else {
      // Stop any auto read first
      if (autoReadInterval.current) {
        clearInterval(autoReadInterval.current);
        autoReadInterval.current = null;
      }
      setReadingMode('manual');
      setIsReading(false);
      setReadingSilo(null);
      setAutoReadProgress(0);
    }
  }, [readingMode]);

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

  return {
    // State
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

    // Actions
    handleSiloClick,
    handleSiloHover,
    handleSiloMouseMove,
    handleSiloLeave,
    startAutoRead,
    handleManualReadMode,

    // Utilities
    isSiloReading,
    isSiloSelected,
    getSiloByNumber,
    cleanup,

    // Direct setters (for input field)
    setSelectedSilo,
    setSelectedTemp,
    setManualTestDuration,
    setAutoTestInterval,
  };
};