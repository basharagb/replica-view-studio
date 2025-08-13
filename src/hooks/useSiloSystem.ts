import { useState, useRef, useCallback, useEffect } from 'react';
import { Silo, SiloSystemState, ReadingMode, TooltipPosition } from '../types/silo';
import { getAllSilos, findSiloByNumber, regenerateAllSiloData, setCurrentScanSilo, markSiloCompleted, clearAutoTestState as clearAutoTestSensorState } from '../services/siloData';
import { fetchSiloDataWithRetry } from '../services/realSiloApiService';

// Persistent auto test state management
interface AutoTestState {
  isActive: boolean;
  currentIndex: number;
  progress: number;
  startTime: number;
  readingSilo: number | null;
}

const AUTO_TEST_STORAGE_KEY = 'replica-view-studio-auto-test-state';

// Save auto test state to localStorage
const saveAutoTestState = (state: AutoTestState) => {
  try {
    localStorage.setItem(AUTO_TEST_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save auto test state:', error);
  }
};

// Load auto test state from localStorage
const loadAutoTestState = (): AutoTestState | null => {
  try {
    const saved = localStorage.getItem(AUTO_TEST_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn('Failed to load auto test state:', error);
    return null;
  }
};

// Clear auto test state from localStorage
const clearAutoTestState = () => {
  try {
    localStorage.removeItem(AUTO_TEST_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear auto test state:', error);
  }
};

export const useSiloSystem = () => {
  // Core state
  const [selectedSilo, setSelectedSilo] = useState<number>(112);
  const [selectedTemp, setSelectedTemp] = useState<number>(0.2);
  const [hoveredSilo, setHoveredSilo] = useState<Silo | null>(null);

  // Auto-fetch API data when silo is selected to show accurate sensor readings
  useEffect(() => {
    const fetchSelectedSiloData = async () => {
      if (selectedSilo) {
        try {
          const apiData = await fetchSiloDataWithRetry(selectedSilo, 2, 500);
          // Auto-fetched data for selected silo (logging removed for performance)
          // Update selected temperature with real API data
          setSelectedTemp(apiData.maxTemp);
          // Force UI re-render to show accurate sensor readings
          regenerateAllSiloData();
        } catch (error) {
          // Could not fetch data for silo, using simulated data (logging removed for performance)
        }
      }
    };

    fetchSelectedSiloData();
  }, [selectedSilo]);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ x: 0, y: 0 });

  // Reading control states
  const [readingMode, setReadingMode] = useState<ReadingMode>('manual');
  const [isReading, setIsReading] = useState<boolean>(false);
  const [readingSilo, setReadingSilo] = useState<number | null>(null);
  const [autoReadProgress, setAutoReadProgress] = useState<number>(0);
  const [autoReadCompleted, setAutoReadCompleted] = useState<boolean>(false);
  const [dataVersion, setDataVersion] = useState<number>(0);
  const [manualTestDuration, setManualTestDuration] = useState<number>(0.05); // 3 seconds per silo (3/60 = 0.05 minutes) - optimized for speed
  const [autoTestInterval, setAutoTestInterval] = useState<number>(60); // 1 hour default
  const [isWaitingForRestart, setIsWaitingForRestart] = useState<boolean>(false);
  const [waitTimeRemaining, setWaitTimeRemaining] = useState<number>(0);
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());
  const [isIdleDetectionActive, setIsIdleDetectionActive] = useState<boolean>(false);
  
  // Persistent auto test state
  const [currentAutoTestIndex, setCurrentAutoTestIndex] = useState<number>(0);
  
  const autoReadInterval = useRef<NodeJS.Timeout | null>(null);
  const restartWaitInterval = useRef<NodeJS.Timeout | null>(null);
  const idleDetectionInterval = useRef<NodeJS.Timeout | null>(null);
  const currentSiloTimeout = useRef<NodeJS.Timeout | null>(null); // Track current silo timeout

  // Restore auto test state on component mount
  useEffect(() => {
    const savedState = loadAutoTestState();
    if (savedState && savedState.isActive) {
      // Resume auto test from saved state
      setReadingMode('auto');
      setIsReading(true);
      setCurrentAutoTestIndex(savedState.currentIndex);
      setAutoReadProgress(savedState.progress);
      setReadingSilo(savedState.readingSilo);
      
      // Resume the auto test process
      resumeAutoTest(savedState);
    }
  }, []);

  // Resume auto test from saved state
  const resumeAutoTest = useCallback((savedState: AutoTestState) => {
    const allSilos = getAllSilos();
    if (!allSilos || allSilos.length === 0) return;

    let currentIndex = savedState.currentIndex;
    const startTime = Date.now();
    
    // Calculate remaining time for current silo
    const elapsedTime = startTime - savedState.startTime;
    const remainingTime = Math.max(0, 24000 - (elapsedTime % 24000));

    // Start from current silo with remaining time
    if (currentIndex < allSilos.length) {
      const currentSilo = allSilos[currentIndex];
      setReadingSilo(currentSilo.num);
      setSelectedSilo(currentSilo.num);
      setSelectedTemp(currentSilo.temp);

      // Continue with remaining time for current silo
      currentSiloTimeout.current = setTimeout(() => {
        currentIndex++;
        continueAutoTest(allSilos, currentIndex);
      }, remainingTime);
    }
  }, []);

  // Continue auto test from specific index with real API integration
  const continueAutoTest = useCallback((allSilos: Silo[], startIndex: number) => {
    let currentIndex = startIndex;

    const interval = setInterval(async () => {
      if (currentIndex >= allSilos.length) {
        // Auto test complete
        clearInterval(interval);
        autoReadInterval.current = null;
        setIsReading(false);
        setReadingSilo(null);
        setAutoReadProgress(100);
        setAutoReadCompleted(true);
        clearAutoTestState();
        clearAutoTestSensorState();
        // Auto test completed - all 150 silos tested
        return;
      }

      const currentSilo = allSilos[currentIndex];
      setReadingSilo(currentSilo.num);
      setSelectedSilo(currentSilo.num);
      setAutoReadProgress(((currentIndex + 1) / allSilos.length) * 100);
      setCurrentAutoTestIndex(currentIndex);
      
      // Set current scanning silo for sensor display logic
      setCurrentScanSilo(currentSilo.num);

      // Auto test: Starting silo (logging removed for performance)

      // Fetch real silo data from API during the 24-second interval
      try {
        const apiData = await fetchSiloDataWithRetry(currentSilo.num, 2, 500);
        // Auto test: Fetched real data for silo (logging removed for performance)
        
        // Update UI with real API data
        setSelectedTemp(apiData.maxTemp);
        
        // Mark this silo as completed for sensor display logic
        markSiloCompleted(currentSilo.num);
        
        // Force a re-render without clearing cached API data
        setDataVersion(prev => prev + 1);
        
      } catch (error) {
        console.error(`Auto test: Failed to fetch data for silo ${currentSilo.num}:`, error);
        // Keep original temperature on API failure
        setSelectedTemp(currentSilo.temp);
      }

      // Save current state
      saveAutoTestState({
        isActive: true,
        currentIndex,
        progress: ((currentIndex + 1) / allSilos.length) * 100,
        startTime: Date.now(),
        readingSilo: currentSilo.num
      });

      currentIndex++;
    }, 24000); // Fixed 24-second intervals for real physical silo testing

    autoReadInterval.current = interval;
  }, []);

  // Handle silo click - Block clicks during manual test loading
  const handleSiloClick = useCallback((siloNum: number, temp: number) => {
    if (readingMode === 'manual' && !isReading) {
      // Start manual reading only if not already reading
      console.log(`🔄 [MANUAL TEST] Manual test triggered for silo ${siloNum}`);
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

  // Start manual reading with loading animation and real API integration
  const startManualRead = useCallback(async (siloNum: number, temp: number) => {
    setIsReading(true);
    setReadingSilo(siloNum);
    
    console.log(`🔄 [MANUAL TEST] Starting manual test for silo ${siloNum} with ${manualTestDuration} minute duration`);

    // Fetch real silo data from API during the test duration
    try {
      // Start API fetch immediately
      const apiDataPromise = fetchSiloDataWithRetry(siloNum, 3, 1000);
      
      // Use manual test duration (in minutes, convert to milliseconds)
      const testDuration = manualTestDuration * 60 * 1000;
      
      // Wait for both the test duration and API fetch to complete
      const [apiData] = await Promise.all([
        apiDataPromise,
        new Promise(resolve => setTimeout(resolve, testDuration))
      ]);

      console.log(`✅ [MANUAL TEST] Manual test completed for silo ${siloNum} - got fresh data`);
      
      // Update UI with real API data and force re-render
      setSelectedSilo(siloNum);
      setSelectedTemp(apiData.maxTemp);
      setIsReading(false);
      setReadingSilo(null);
      
      // Force a re-render with fresh data
      setDataVersion(prev => prev + 1);
      
    } catch (error) {
      console.error(`❌ [MANUAL TEST] Manual test failed for silo ${siloNum}:`, error);
      
      // Fallback with proper timing
      setTimeout(() => {
        setSelectedSilo(siloNum);
        setSelectedTemp(temp);
        setIsReading(false);
        setReadingSilo(null);
      }, manualTestDuration * 60 * 1000);
    }
  }, [manualTestDuration]);

  // Fixed 24-second duration for real physical silo testing
  const getSiloTestDuration = useCallback(() => {
    // Fixed 24 seconds per silo for real physical sensor readings
    return 24000; // 24 seconds
  }, []);

  // Start/stop auto reading with persistent state
  const startAutoRead = useCallback(() => {
    if (readingMode === 'auto') {
      // Stop auto read and clear ALL timers but SAVE current position
      if (autoReadInterval.current) {
        clearInterval(autoReadInterval.current);
        autoReadInterval.current = null;
      }
      if (currentSiloTimeout.current) {
        clearTimeout(currentSiloTimeout.current);
        currentSiloTimeout.current = null;
      }
      if (restartWaitInterval.current) {
        clearInterval(restartWaitInterval.current);
        restartWaitInterval.current = null;
      }
      
      // Save current position for resume (don't clear persistent state)
      const allSilos = getAllSilos();
      if (allSilos && allSilos.length > 0) {
        saveAutoTestState({
          isActive: false, // Mark as stopped but keep position
          currentIndex: currentAutoTestIndex,
          progress: autoReadProgress,
          startTime: Date.now(),
          readingSilo: readingSilo
        });
      }
      
      // Clear auto test sensor state when stopping
      clearAutoTestSensorState();
      
      setIsReading(false);
      setReadingSilo(null);
      setReadingMode('none');
      setIsWaitingForRestart(false);
      setWaitTimeRemaining(0);
      // Auto test stopped by user (logging removed for performance)
      return;
    }

    // Check if resuming from saved state (either active or stopped)
    const savedState = loadAutoTestState();
    if (savedState && (savedState.isActive || savedState.currentIndex > 0)) {
      // Resume from saved state (whether it was active or stopped)
      savedState.isActive = true; // Mark as active when resuming
      saveAutoTestState(savedState); // Update state to active
      resumeAutoTest(savedState);
      return;
    }
    
    setReadingMode('auto');
    setIsReading(true);
    setAutoReadProgress(0);
    setAutoReadCompleted(false);
    setCurrentAutoTestIndex(0);

    const allSilos = getAllSilos();

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

    // Start immediately with first silo
    const currentSilo = allSilos[0];
    setReadingSilo(currentSilo.num);
    setSelectedSilo(currentSilo.num);
    setSelectedTemp(currentSilo.temp);
    setAutoReadProgress((1 / allSilos.length) * 100);
    
    // Set current scanning silo for sensor display logic
    setCurrentScanSilo(currentSilo.num);
    
    // Save initial state
    saveAutoTestState({
      isActive: true,
      currentIndex: 0,
      progress: (1 / allSilos.length) * 100,
      startTime: Date.now(),
      readingSilo: currentSilo.num
    });

    // Continue with the rest of the silos after 24 seconds
    currentSiloTimeout.current = setTimeout(() => {
      continueAutoTest(allSilos, 1);
    }, 24000);
  }, [readingMode, isReading, autoReadCompleted, resumeAutoTest, continueAutoTest]);

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
    lastActivityTime,
    isIdleDetectionActive,

    // Actions
    handleSiloClick,
    handleSiloHover,
    handleSiloMouseMove,
    handleSiloLeave,
    startAutoRead,
    handleManualReadMode,
    startIdleDetection,
    updateActivityTime,

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
