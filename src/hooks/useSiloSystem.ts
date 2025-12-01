import { useState, useRef, useCallback, useEffect } from 'react';
import { Silo, SiloSystemState, ReadingMode, TooltipPosition } from '../types/silo';
import { getAllSilos, findSiloByNumber, regenerateAllSiloData, setCurrentScanSilo, markSiloCompleted, clearAutoTestState as clearAutoTestSensorState } from '../services/siloData';
import { fetchSiloDataWithRetry, clearSiloCache } from '../services/realSiloApiService';
import { useDailyScheduler } from './useDailyScheduler';

// Persistent auto test state management
interface AutoTestState {
  isActive: boolean;
  currentIndex: number;
  progress: number;
  startTime: number;
  readingSilo: number | null;
  disconnectedSilos?: number[];
  retryCount?: number;
  isRetryPhase?: boolean;
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
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ x: 0, y: 0 });

  // Reading control states
  const [readingMode, setReadingMode] = useState<ReadingMode>('manual');
  const [isReading, setIsReading] = useState<boolean>(false);

  // Auto-fetch API data when silo is selected to show accurate sensor readings
  // 🚫 CRITICAL: COMPLETELY BLOCKED during auto reading mode to prevent color changes
  useEffect(() => {
    const fetchSelectedSiloData = async () => {
      // 🚫 TRIPLE CHECK: Block API calls during auto reading mode
      if (selectedSilo && readingMode !== 'auto' && !isReading) {
        try {
          console.log(`🔍 [SELECTION API] Fetching data for selected silo ${selectedSilo} (mode: ${readingMode})`);
          const apiData = await fetchSiloDataWithRetry(selectedSilo, 2, 500);
          // Update selected temperature with real API data
          setSelectedTemp(apiData.maxTemp);
          // Force UI re-render to show accurate sensor readings
          regenerateAllSiloData();
        } catch (error) {
          console.warn(`⚠️ [SELECTION API] Could not fetch data for silo ${selectedSilo}:`, error);
        }
      } else if (readingMode === 'auto') {
        console.log(`🚫 [SELECTION API] Blocked API fetch for silo ${selectedSilo} during auto reading mode`);
      }
    };

    fetchSelectedSiloData();
  }, [selectedSilo, readingMode, isReading]);
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
  
  // Disconnected silos retry mechanism
  const [disconnectedSilos, setDisconnectedSilos] = useState<number[]>([]);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [isRetryPhase, setIsRetryPhase] = useState<boolean>(false);
  const [maxRetries] = useState<number>(6);
  
  const autoReadInterval = useRef<NodeJS.Timeout | null>(null);
  const restartWaitInterval = useRef<NodeJS.Timeout | null>(null);
  const idleDetectionInterval = useRef<NodeJS.Timeout | null>(null);
  const currentSiloTimeout = useRef<NodeJS.Timeout | null>(null); // Track current silo timeout

  // Daily scheduler integration - using refs to avoid circular dependency
  const startAutoReadRef = useRef<(() => void) | null>(null);
  
  const handleScheduledStart = useCallback(() => {
    console.log('📅 [SCHEDULER] Starting scheduled auto readings');
    if (readingMode !== 'auto' && !isReading && startAutoReadRef.current) {
      startAutoReadRef.current();
    }
  }, [readingMode, isReading]);

  const handleScheduledStop = useCallback(() => {
    console.log('📅 [SCHEDULER] Stopping scheduled auto readings');
    if (readingMode === 'auto' && isReading && startAutoReadRef.current) {
      // Stop auto readings by calling startAutoRead again (it toggles)
      startAutoReadRef.current();
    }
  }, [readingMode, isReading]);

  // Initialize daily scheduler
  const {
    schedulesConfig,
    nextScheduleInfo,
    isScheduleActive,
    toggleGlobal,
    addNewSchedule,
    updateScheduleById,
    deleteScheduleById,
    toggleScheduleById,
    validateSchedule,
    checkConflicts,
    forceCheckSchedule
  } = useDailyScheduler(handleScheduledStart, handleScheduledStop, isReading);

  // Note: useEffect for restoring auto test state moved to after function definitions

  // Continue auto test from specific index with strict sequential control
  const continueAutoTest = useCallback((allSilos: Silo[], startIndex: number) => {
    // CRITICAL: Clear any existing intervals to prevent race conditions
    if (autoReadInterval.current) {
      console.log(`🧹 [SEQUENTIAL FIX] Clearing existing interval to prevent race conditions`);
      clearInterval(autoReadInterval.current);
      autoReadInterval.current = null;
    }
    if (currentSiloTimeout.current) {
      console.log(`🧹 [SEQUENTIAL FIX] Clearing existing timeout to prevent race conditions`);
      clearTimeout(currentSiloTimeout.current);
      currentSiloTimeout.current = null;
    }

    let currentIndex = startIndex;
    const detectedDisconnectedSilos: number[] = [];

    // ENHANCED: Validate start index and silo sequence
    if (startIndex < 0 || startIndex >= allSilos.length) {
      console.error(`❌ [SEQUENTIAL ERROR] Invalid start index ${startIndex}, max allowed: ${allSilos.length - 1}`);
      return;
    }

    console.log(`🔄 [SEQUENTIAL SCAN] Starting from index ${startIndex}, silo ${allSilos[startIndex]?.num || 'N/A'}`);
    console.log(`📋 [SEQUENTIAL SCAN] Will scan silos: ${allSilos.slice(startIndex).map(s => s.num).join(' → ')}`);

    const interval = setInterval(async () => {
      // Validate current index bounds
      if (currentIndex >= allSilos.length) {
        // Main auto test complete - now check for disconnected silos
        clearInterval(interval);
        autoReadInterval.current = null;
        
        console.log(`🏁 [SEQUENTIAL COMPLETE] Scanned ${currentIndex} silos. Found ${detectedDisconnectedSilos.length} disconnected: ${detectedDisconnectedSilos.join(', ')}`);
        
        if (detectedDisconnectedSilos.length > 0) {
          setDisconnectedSilos(detectedDisconnectedSilos);
          setRetryCount(0);
          // Start retry cycles for disconnected silos
          setTimeout(() => {
            startDisconnectedSilosRetry(detectedDisconnectedSilos);
          }, 2000); // 2 second pause before starting retries
        } else {
          // No disconnected silos - complete the test
          setIsReading(false);
          setReadingSilo(null);
          setAutoReadProgress(100);
          setAutoReadCompleted(true);
          clearAutoTestState();
          clearAutoTestSensorState();
          console.log(`🎉 [SEQUENTIAL COMPLETE] All ${currentIndex} silos scanned sequentially - no retries needed`);
        }
        return;
      }

      const currentSilo = allSilos[currentIndex];
      
      // ENHANCED: Validate silo exists and has valid number
      if (!currentSilo || !currentSilo.num) {
        console.error(`❌ [SEQUENTIAL ERROR] Invalid silo at index ${currentIndex}:`, currentSilo);
        currentIndex++; // Skip invalid silo
        return;
      }

      setReadingSilo(currentSilo.num);
      setSelectedSilo(currentSilo.num);
      setAutoReadProgress(((currentIndex + 1) / allSilos.length) * 100);
      setCurrentAutoTestIndex(currentIndex);
      
      // Set current scanning silo for sensor display logic
      setCurrentScanSilo(currentSilo.num);

      // ENHANCED: Sequential scanning debug with next silo preview
      const nextSilo = allSilos[currentIndex + 1];
      console.log(`🔍 [SEQUENTIAL SCAN] Step ${currentIndex + 1}/${allSilos.length}: Silo ${currentSilo.num} → Next: ${nextSilo?.num || 'COMPLETE'}`);

      // Fetch real silo data from API during the 24-second interval
      try {
        // Clear silo cache to ensure fresh data on re-fetch
        clearSiloCache(currentSilo.num);
        const apiData = await fetchSiloDataWithRetry(currentSilo.num, 2, 500);
        
        // Check if silo is disconnected and track it
        const isDisconnected = apiData.siloColor === '#9ca3af' || apiData.sensors.every(temp => temp === 0);
        if (isDisconnected) {
          detectedDisconnectedSilos.push(currentSilo.num);
          console.log(`🔌 [DISCONNECTED] Silo ${currentSilo.num} is disconnected - will retry later`);
        }
        
        // Update UI with real API data
        setSelectedTemp(apiData.maxTemp);
        
        // Mark this silo as completed for sensor display logic
        markSiloCompleted(currentSilo.num);
        
        // Force regeneration of all silo data to update colors immediately
        regenerateAllSiloData();
        
        // Force a re-render without clearing cached API data
        setDataVersion(prev => prev + 1);
        
      } catch (error) {
        console.error(`❌ [SEQUENTIAL ERROR] Failed to fetch data for silo ${currentSilo.num}:`, error);
        // Consider failed API calls as disconnected
        detectedDisconnectedSilos.push(currentSilo.num);
        // Keep original temperature on API failure
        setSelectedTemp(currentSilo.temp);
      }

      // ENHANCED: Save state with sequential validation
      saveAutoTestState({
        isActive: true,
        currentIndex,
        progress: ((currentIndex + 1) / allSilos.length) * 100,
        startTime: Date.now(),
        readingSilo: currentSilo.num,
        disconnectedSilos: detectedDisconnectedSilos,
        retryCount: 0,
        isRetryPhase: false
      });

      // CRITICAL: Increment index ONLY after successful processing
      currentIndex++;
      console.log(`➡️ [SEQUENTIAL NEXT] Moving to index ${currentIndex} (silo ${allSilos[currentIndex]?.num || 'COMPLETE'})`);
      
    }, 24000); // Fixed 24-second intervals for real physical silo testing

    // Set the new interval
    autoReadInterval.current = interval;
    console.log(`✅ [SEQUENTIAL SCAN] Started sequential interval for ${allSilos.length - startIndex} remaining silos`);
  }, []);

  // Resume auto test from saved state with strict sequential control
  const resumeAutoTest = useCallback((savedState: AutoTestState) => {
    const allSilos = getAllSilos();
    if (!allSilos || allSilos.length === 0) return;

    const currentIndex = savedState.currentIndex;
    
    // ENHANCED: Validate saved state
    if (currentIndex < 0 || currentIndex >= allSilos.length) {
      console.error(`❌ [RESUME ERROR] Invalid saved index ${currentIndex}, starting fresh scan`);
      clearAutoTestState();
      clearAutoTestSensorState();
      // Start fresh scan from beginning
      continueAutoTest(allSilos, 0);
      return;
    }

    const currentSilo = allSilos[currentIndex];
    if (!currentSilo || !currentSilo.num) {
      console.error(`❌ [RESUME ERROR] Invalid silo at saved index ${currentIndex}, starting fresh scan`);
      clearAutoTestState();
      clearAutoTestSensorState();
      continueAutoTest(allSilos, 0);
      return;
    }

    console.log(`🔄 [SEQUENTIAL RESUME] Resuming from index ${currentIndex}, silo ${currentSilo.num}`);
    console.log(`📋 [SEQUENTIAL RESUME] Remaining silos: ${allSilos.slice(currentIndex).map(s => s.num).join(' → ')}`);

    // Resume directly with continueAutoTest to maintain single interval control
    // This ensures no race conditions between multiple intervals
    continueAutoTest(allSilos, currentIndex);
  }, [continueAutoTest]);

  // Start retry cycles for disconnected silos
  const startDisconnectedSilosRetry = useCallback((disconnectedSilosList: number[]) => {
    if (disconnectedSilosList.length === 0) {
      console.log(`✅ [RETRY COMPLETE] No disconnected silos to retry`);
      setIsReading(false);
      setReadingSilo(null);
      setAutoReadProgress(100);
      setAutoReadCompleted(true);
      clearAutoTestState();
      clearAutoTestSensorState();
      return;
    }

    console.log(`🔄 [RETRY START] Starting retry cycles for ${disconnectedSilosList.length} disconnected silos: ${disconnectedSilosList.join(', ')}`);
    
    let currentRetry = 1;
    const maxRetries = 6; // Maximum retry cycles
    
    const runRetryForDisconnectedSilos = (silosToRetry: number[]) => {
      if (currentRetry > maxRetries || silosToRetry.length === 0) {
        // Max retries reached or all silos connected
        console.log(`🏁 [RETRY COMPLETE] Finished after ${currentRetry - 1} cycles. Remaining disconnected: ${silosToRetry.length} silos`);
        setIsReading(false);
        setReadingSilo(null);
        setAutoReadProgress(100);
        setAutoReadCompleted(true);
        clearAutoTestState();
        clearAutoTestSensorState();
        setIsRetryPhase(false);
        return;
      }

      console.log(`🔄 [RETRY CYCLE ${currentRetry}/${maxRetries}] Testing ${silosToRetry.length} disconnected silos`);
      setIsRetryPhase(true);
      setRetryCount(currentRetry);
      
      let currentRetryIndex = 0;
      const stillDisconnected: number[] = [];
      
      const retryInterval = setInterval(async () => {
        if (currentRetryIndex >= silosToRetry.length) {
          // Retry cycle complete
          clearInterval(retryInterval);
          autoReadInterval.current = null;
          
          console.log(`✅ [RETRY CYCLE ${currentRetry}] Complete. Still disconnected: ${stillDisconnected.length} silos`);
          
          if (stillDisconnected.length === 0) {
            // All silos now connected!
            console.log(`🎉 [ALL CONNECTED] All silos connected after ${currentRetry} retry cycles!`);
            setIsReading(false);
            setReadingSilo(null);
            setAutoReadProgress(100);
            setAutoReadCompleted(true);
            clearAutoTestState();
            clearAutoTestSensorState();
            setIsRetryPhase(false);
            return;
          }
          
          // 5-second pause between retry cycles
          setTimeout(() => {
            currentRetry++;
            runRetryForDisconnectedSilos(stillDisconnected);
          }, 5000);
          return;
        }

        const currentSilo = { num: silosToRetry[currentRetryIndex] };
        setReadingSilo(currentSilo.num);
        setSelectedSilo(currentSilo.num);
        
        // Calculate retry progress (extends beyond 100%)
        const retryProgress = 100 + ((currentRetry - 1) * 30) + ((currentRetryIndex + 1) / silosToRetry.length) * 30;
        setAutoReadProgress(Math.min(130, retryProgress)); // Cap at 130%
        
        console.log(`🔄 [RETRY ${currentRetry}.${currentRetryIndex + 1}] Testing silo ${currentSilo.num} (${currentRetryIndex + 1}/${silosToRetry.length})`);

        try {
          clearSiloCache(currentSilo.num);
          const apiData = await fetchSiloDataWithRetry(currentSilo.num, 2, 500);
          
          // Check if still disconnected
          const isStillDisconnected = apiData.siloColor === '#9ca3af' || apiData.sensors.every(temp => temp === 0);
          
          if (isStillDisconnected) {
            stillDisconnected.push(currentSilo.num);
            console.log(`❌ [RETRY ${currentRetry}.${currentRetryIndex + 1}] Silo ${currentSilo.num} still disconnected`);
          } else {
            console.log(`✅ [RETRY ${currentRetry}.${currentRetryIndex + 1}] Silo ${currentSilo.num} now connected! Max temp: ${apiData.maxTemp}°C`);
            setSelectedTemp(apiData.maxTemp);
            markSiloCompleted(currentSilo.num);
            
            // Force regeneration of all silo data to update colors immediately
            regenerateAllSiloData();
          }
          
          // Force UI update
          setDataVersion(prev => prev + 1);
          
        } catch (error) {
          console.error(`❌ [RETRY ${currentRetry}.${currentRetryIndex + 1}] Failed to test silo ${currentSilo.num}:`, error);
          stillDisconnected.push(currentSilo.num);
        }

        // Save retry state
        saveAutoTestState({
          isActive: true,
          currentIndex: 0, // Not applicable during retry
          progress: retryProgress,
          startTime: Date.now(),
          readingSilo: currentSilo.num,
          disconnectedSilos: disconnectedSilosList,
          retryCount: currentRetry,
          isRetryPhase: true
        });

        currentRetryIndex++;
      }, 12000); // 12 seconds per retry (faster than main scan)

      autoReadInterval.current = retryInterval;
    };
    
    runRetryForDisconnectedSilos(disconnectedSilosList);
  }, []);

  // Handle manual API refresh for maintenance interface during auto test
  const handleManualApiRefresh = useCallback(async (siloNum: number) => {
    try {
      console.log(`🔄 [MAINTENANCE REFRESH] Manual API refresh for silo ${siloNum} during auto test`);
      
      // Clear cache and fetch fresh data
      clearSiloCache(siloNum);
      const apiData = await fetchSiloDataWithRetry(siloNum, 2, 500);
      
      // Update UI with fresh API data
      setSelectedSilo(siloNum);
      setSelectedTemp(apiData.maxTemp);
      
      // Force UI re-render to update silo colors immediately
      setDataVersion(prev => prev + 1);
      
      console.log(`✅ [MAINTENANCE REFRESH] Silo ${siloNum} updated - Color: ${apiData.siloColor}, Max temp: ${apiData.maxTemp}°C`);
      
    } catch (error) {
      console.error(`❌ [MAINTENANCE REFRESH] Failed to refresh silo ${siloNum}:`, error);
      // Still update selection even if API fails
      setSelectedSilo(siloNum);
    }
  }, []);

  // Handle silo click - COMPLETELY BLOCK all interactions during auto reading mode
  const handleSiloClick = useCallback((siloNum: number, temp: number) => {
    // 🚫 CRITICAL FIX: Block ALL silo interactions during auto reading mode
    // This prevents any mouse movement from causing color changes or API calls
    if (readingMode === 'auto') {
      console.log(`🚫 [AUTO MODE BLOCK] Blocked silo ${siloNum} interaction during auto reading mode`);
      return; // Exit early - no state changes allowed
    }
    
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

  // Handle silo hover - Allow tooltips but prevent any state changes during auto mode
  const handleSiloHover = useCallback((siloNum: number, temp: number, event: React.MouseEvent) => {
    // Always allow tooltips for user feedback, but prevent any other state changes during auto mode
    setHoveredSilo({ num: siloNum, temp: temp });
    setTooltipPosition({ x: event.clientX, y: event.clientY });
    
    // Log hover during auto mode for debugging
    if (readingMode === 'auto') {
      console.log(`👆 [AUTO MODE HOVER] Showing tooltip for silo ${siloNum} (no state changes)`);
    }
  }, [readingMode]);

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
      // Clear silo cache to ensure fresh data on re-fetch
      clearSiloCache(siloNum);
      console.log(`🗑️ [MANUAL TEST] Cleared cache for silo ${siloNum} to ensure fresh data`);
      
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
          readingSilo: readingSilo,
          disconnectedSilos: disconnectedSilos,
          retryCount: retryCount,
          isRetryPhase: isRetryPhase
        });
      }
      
      // Clear auto test sensor state when stopping - but API cache is preserved
      // so previously scanned silos will still show their API colors due to 
      // the priority logic in getSiloColorByNumber()
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
      // Validate saved state against current silo data
      const allSilos = getAllSilos();
      const isValidIndex = savedState.currentIndex >= 0 && savedState.currentIndex < allSilos.length;
      const isValidSilo = savedState.readingSilo && allSilos.some(silo => silo.num === savedState.readingSilo);
      
      if (isValidIndex && isValidSilo) {
        // Resume from valid saved state
        console.log(`🔄 [AUTO SCAN RESUME] Resuming from silo ${savedState.readingSilo} at index ${savedState.currentIndex}`);
        savedState.isActive = true; // Mark as active when resuming
        saveAutoTestState(savedState); // Update state to active
        resumeAutoTest(savedState);
        return;
      } else {
        // Invalid saved state - clear it and start fresh
        console.warn(`⚠️ [AUTO SCAN VALIDATION] Invalid saved state detected - silo ${savedState.readingSilo} at index ${savedState.currentIndex}. Starting fresh scan.`);
        clearAutoTestState();
        clearAutoTestSensorState();
      }
    }
    
    setReadingMode('auto');
    setIsReading(true);
    setAutoReadProgress(0);
    setAutoReadCompleted(false);
    setCurrentAutoTestIndex(0);
    
    // Reset retry state for new auto test
    setDisconnectedSilos([]);
    setRetryCount(0);
    setIsRetryPhase(false);

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
      console.error('❌ [AUTO SCAN VALIDATION] Invalid silos found:', invalidSilos);
      console.error('❌ [AUTO SCAN VALIDATION] This will prevent auto scan from starting');
      setIsReading(false);
      setReadingSilo(null);
      setAutoReadProgress(0);
      setReadingMode('none');
      return;
    }

    // 🔍 DEBUG: Log all silos that will be scanned
    console.log(`🔍 [AUTO SCAN DEBUG] Total silos to scan: ${allSilos.length}`);
    console.log(`🔍 [AUTO SCAN DEBUG] Silo numbers: [${allSilos.map(s => s.num).sort((a, b) => a - b).join(', ')}]`);
    console.log(`🔍 [AUTO SCAN DEBUG] First silo: ${allSilos[0]?.num}, Last silo: ${allSilos[allSilos.length - 1]?.num}`);
    
    // Check for any missing silo numbers in expected range
    const siloNumbers = allSilos.map(s => s.num).sort((a, b) => a - b);
    const minSilo = Math.min(...siloNumbers);
    const maxSilo = Math.max(...siloNumbers);
    const missingSilos = [];
    for (let i = minSilo; i <= maxSilo; i++) {
      if (!siloNumbers.includes(i)) {
        missingSilos.push(i);
      }
    }
    if (missingSilos.length > 0) {
      console.warn(`⚠️ [AUTO SCAN DEBUG] Missing silo numbers in range ${minSilo}-${maxSilo}: [${missingSilos.join(', ')}]`);
    }

    // Always start from first silo for fresh auto scan
    const startIndex = 0;
    const currentSilo = allSilos[startIndex];
    console.log(`🚀 [AUTO SCAN START] Starting fresh auto scan from first silo: ${currentSilo.num} (index ${startIndex})`);
    setReadingSilo(currentSilo.num);
    setSelectedSilo(currentSilo.num);
    setCurrentAutoTestIndex(startIndex);
    setAutoReadProgress(((startIndex + 1) / allSilos.length) * 100);
    
    // Set current scanning silo for sensor display logic
    setCurrentScanSilo(currentSilo.num);
    
    // Clear cache and fetch fresh data for first silo
    const fetchFirstSiloData = async () => {
      try {
        clearSiloCache(currentSilo.num);
        console.log(`🗑️ [AUTO TEST] Cleared cache for first silo ${currentSilo.num} to ensure fresh data`);
        
        const apiData = await fetchSiloDataWithRetry(currentSilo.num, 2, 500);
        setSelectedTemp(apiData.maxTemp);
        
        // Mark this silo as completed for sensor display logic
        markSiloCompleted(currentSilo.num);
        
        // Force regeneration of all silo data to update colors immediately
        regenerateAllSiloData();
        
        // Force a re-render with fresh data
        setDataVersion(prev => prev + 1);
      } catch (error) {
        console.error(`Auto test: Failed to fetch data for first silo ${currentSilo.num}:`, error);
        setSelectedTemp(currentSilo.temp);
      }
    };
    
    // Start fetching data for first silo
    fetchFirstSiloData();
    
    // Save initial state
    saveAutoTestState({
      isActive: true,
      currentIndex: startIndex,
      progress: ((startIndex + 1) / allSilos.length) * 100,
      startTime: Date.now(),
      readingSilo: currentSilo.num,
      disconnectedSilos: [],
      retryCount: 0,
      isRetryPhase: false
    });

    // Continue with the rest of the silos after 24 seconds
    currentSiloTimeout.current = setTimeout(() => {
      continueAutoTest(allSilos, startIndex + 1);
    }, 24000);
  }, [readingMode, isReading, autoReadCompleted, resumeAutoTest, continueAutoTest]);

  // Assign startAutoRead to ref for scheduler access
  useEffect(() => {
    startAutoReadRef.current = startAutoRead;
  }, [startAutoRead]);

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

  // Restore auto test state on component mount (moved here after function definitions)
  useEffect(() => {
    const savedState = loadAutoTestState();
    if (savedState && savedState.isActive) {
      // Resume auto test from saved state
      setReadingMode('auto');
      setIsReading(true);
      setCurrentAutoTestIndex(savedState.currentIndex);
      setAutoReadProgress(savedState.progress);
      setReadingSilo(savedState.readingSilo);
      setDisconnectedSilos(savedState.disconnectedSilos || []);
      setRetryCount(savedState.retryCount || 0);
      setIsRetryPhase(savedState.isRetryPhase || false);
      
      // Resume the auto test process
      resumeAutoTest(savedState);
    }
  }, [resumeAutoTest]);

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
    
    // Retry mechanism state
    disconnectedSilos,
    retryCount,
    isRetryPhase,
    maxRetries,

    // Daily scheduler state
    schedulesConfig,
    nextScheduleInfo,
    isScheduleActive,

    // Actions
    handleSiloClick,
    handleSiloHover,
    handleSiloMouseMove,
    handleSiloLeave,
    startAutoRead,
    handleManualReadMode,
    handleManualApiRefresh,
    startIdleDetection,
    updateActivityTime,
    
    // Daily scheduler actions
    toggleGlobal,
    addNewSchedule,
    updateScheduleById,
    deleteScheduleById,
    toggleScheduleById,
    validateSchedule,
    checkConflicts,
    forceCheckSchedule,

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
