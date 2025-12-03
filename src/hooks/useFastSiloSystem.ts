import { useState, useRef, useCallback, useEffect } from 'react';
import { Silo, ReadingMode, TooltipPosition } from '../types/silo';
import { getAllSilos, findSiloByNumber, regenerateAllSiloData, setCurrentScanSilo, markSiloCompleted, isSiloCompleted, clearAutoTestState as clearAutoTestSensorState } from '../services/siloData';
import { fetchSiloDataWithRetry, clearSiloCache } from '../services/realSiloApiService';

/**
 * Fast Silo System Hook - For IT Team Testing
 * 
 * This is a simplified version of useSiloSystem with 2-second intervals
 * instead of 24 seconds for rapid testing of all silos.
 * 
 * Key differences from useSiloSystem:
 * - 2-second interval per silo (instead of 24 seconds)
 * - No daily scheduler integration
 * - No persistent state (fresh start each time)
 * - Simplified retry mechanism (2 seconds per retry)
 */

// Fast test state management (session only, not persisted)
interface FastTestState {
  isActive: boolean;
  currentIndex: number;
  progress: number;
  startTime: number;
  readingSilo: number | null;
  disconnectedSilos: number[];
  retryCount: number;
  isRetryPhase: boolean;
}

const FAST_TEST_INTERVAL = 2000; // 2 seconds per silo
const FAST_RETRY_INTERVAL = 2000; // 2 seconds per retry

export const useFastSiloSystem = () => {
  // Core state
  const [selectedSilo, setSelectedSilo] = useState<number>(112);
  const [selectedTemp, setSelectedTemp] = useState<number>(0.2);
  const [hoveredSilo, setHoveredSilo] = useState<Silo | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ x: 0, y: 0 });

  // Reading control states
  const [readingMode, setReadingMode] = useState<ReadingMode>('none');
  const [isReading, setIsReading] = useState<boolean>(false);
  const [readingSilo, setReadingSilo] = useState<number | null>(null);
  const [autoReadProgress, setAutoReadProgress] = useState<number>(0);
  const [autoReadCompleted, setAutoReadCompleted] = useState<boolean>(false);
  const [dataVersion, setDataVersion] = useState<number>(0);
  const [manualTestDuration, setManualTestDuration] = useState<number>(0.03); // ~2 seconds for fast testing
  
  // Auto test state
  const [currentAutoTestIndex, setCurrentAutoTestIndex] = useState<number>(0);
  
  // Disconnected silos retry mechanism
  const [disconnectedSilos, setDisconnectedSilos] = useState<number[]>([]);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [isRetryPhase, setIsRetryPhase] = useState<boolean>(false);
  const [maxRetries] = useState<number>(3); // Reduced retries for fast testing
  
  const autoReadInterval = useRef<NodeJS.Timeout | null>(null);
  const currentSiloTimeout = useRef<NodeJS.Timeout | null>(null);

  // Auto-fetch API data when silo is selected (blocked during auto mode)
  useEffect(() => {
    const fetchSelectedSiloData = async () => {
      if (selectedSilo && readingMode !== 'auto' && !isReading) {
        try {
          console.log(`🚀 [FAST TEST] Fetching data for selected silo ${selectedSilo}`);
          const apiData = await fetchSiloDataWithRetry(selectedSilo, 2, 500);
          setSelectedTemp(apiData.maxTemp);
          regenerateAllSiloData();
        } catch (error) {
          console.warn(`⚠️ [FAST TEST] Could not fetch data for silo ${selectedSilo}:`, error);
        }
      }
    };
    fetchSelectedSiloData();
  }, [selectedSilo, readingMode, isReading]);

  // Continue fast auto test from specific index
  const continueAutoTest = useCallback((allSilos: Silo[], startIndex: number) => {
    // Clear any existing intervals
    if (autoReadInterval.current) {
      clearInterval(autoReadInterval.current);
      autoReadInterval.current = null;
    }
    if (currentSiloTimeout.current) {
      clearTimeout(currentSiloTimeout.current);
      currentSiloTimeout.current = null;
    }

    let currentIndex = startIndex;
    const detectedDisconnectedSilos: number[] = [];
    const scannedSilos: Set<number> = new Set();
    let isProcessing = false;

    if (startIndex < 0 || startIndex >= allSilos.length) {
      console.error(`❌ [FAST TEST] Invalid start index ${startIndex}`);
      return;
    }

    console.log(`⚡ [FAST TEST] Starting from index ${startIndex}, silo ${allSilos[startIndex]?.num}`);
    console.log(`⚡ [FAST TEST] Using ${FAST_TEST_INTERVAL}ms interval per silo`);

    const interval = setInterval(async () => {
      if (isProcessing) return;
      isProcessing = true;

      try {
        if (currentIndex >= allSilos.length) {
          clearInterval(interval);
          autoReadInterval.current = null;
          
          console.log(`🏁 [FAST TEST] Scanned ${currentIndex} silos. Disconnected: ${detectedDisconnectedSilos.length}`);
          
          if (detectedDisconnectedSilos.length > 0) {
            setDisconnectedSilos(detectedDisconnectedSilos);
            setRetryCount(0);
            setTimeout(() => {
              startDisconnectedSilosRetry(detectedDisconnectedSilos);
            }, 1000);
          } else {
            setIsReading(false);
            setReadingSilo(null);
            setAutoReadProgress(100);
            setAutoReadCompleted(true);
            clearAutoTestSensorState();
            console.log(`🎉 [FAST TEST] Complete! All silos tested.`);
          }
          return;
        }

        const currentSilo = allSilos[currentIndex];
        
        if (!currentSilo || !currentSilo.num) {
          currentIndex++;
          return;
        }

        if (scannedSilos.has(currentSilo.num)) {
          currentIndex++;
          return;
        }

        scannedSilos.add(currentSilo.num);
        const calculatedProgress = ((currentIndex + 1) / allSilos.length) * 100;
        
        setReadingSilo(currentSilo.num);
        setSelectedSilo(currentSilo.num);
        setAutoReadProgress(calculatedProgress);
        setCurrentAutoTestIndex(currentIndex);
        setCurrentScanSilo(currentSilo.num);

        console.log(`⚡ [FAST] Silo ${currentSilo.num} | ${calculatedProgress.toFixed(1)}% | ${currentIndex + 1}/${allSilos.length}`);

        try {
          clearSiloCache(currentSilo.num);
          const apiData = await fetchSiloDataWithRetry(currentSilo.num, 1, 300);
          
          const isDisconnected = apiData.siloColor === '#9ca3af' || apiData.sensors.every(temp => temp === 0);
          if (isDisconnected) {
            detectedDisconnectedSilos.push(currentSilo.num);
            console.log(`🔌 [FAST] Silo ${currentSilo.num} disconnected`);
          }
          
          setSelectedTemp(apiData.maxTemp);
          markSiloCompleted(currentSilo.num);
          regenerateAllSiloData();
          setDataVersion(prev => prev + 1);
          
        } catch (error) {
          console.error(`❌ [FAST] Failed silo ${currentSilo.num}:`, error);
          detectedDisconnectedSilos.push(currentSilo.num);
          setSelectedTemp(currentSilo.temp);
        }

        currentIndex++;
      } finally {
        isProcessing = false;
      }
    }, FAST_TEST_INTERVAL);

    autoReadInterval.current = interval;
    console.log(`⚡ [FAST TEST] Started interval for ${allSilos.length - startIndex} silos`);
  }, []);

  // Start retry cycles for disconnected silos (fast version)
  const startDisconnectedSilosRetry = useCallback((disconnectedSilosList: number[]) => {
    if (disconnectedSilosList.length === 0) {
      setIsReading(false);
      setReadingSilo(null);
      setAutoReadProgress(100);
      setAutoReadCompleted(true);
      clearAutoTestSensorState();
      return;
    }

    console.log(`🔄 [FAST RETRY] Starting retry for ${disconnectedSilosList.length} silos`);
    
    let currentRetry = 1;
    
    const runRetryForDisconnectedSilos = (silosToRetry: number[]) => {
      if (currentRetry > maxRetries || silosToRetry.length === 0) {
        console.log(`🏁 [FAST RETRY] Complete. Remaining disconnected: ${silosToRetry.length}`);
        setIsReading(false);
        setReadingSilo(null);
        setAutoReadProgress(100);
        setAutoReadCompleted(true);
        clearAutoTestSensorState();
        setIsRetryPhase(false);
        return;
      }

      console.log(`🔄 [FAST RETRY ${currentRetry}/${maxRetries}] Testing ${silosToRetry.length} silos`);
      setIsRetryPhase(true);
      setRetryCount(currentRetry);
      
      let currentRetryIndex = 0;
      const stillDisconnected: number[] = [];
      
      const retryInterval = setInterval(async () => {
        if (currentRetryIndex >= silosToRetry.length) {
          clearInterval(retryInterval);
          autoReadInterval.current = null;
          
          if (stillDisconnected.length === 0) {
            console.log(`🎉 [FAST RETRY] All silos connected!`);
            setIsReading(false);
            setReadingSilo(null);
            setAutoReadProgress(100);
            setAutoReadCompleted(true);
            clearAutoTestSensorState();
            setIsRetryPhase(false);
            return;
          }
          
          setTimeout(() => {
            currentRetry++;
            runRetryForDisconnectedSilos(stillDisconnected);
          }, 2000);
          return;
        }

        const currentSilo = { num: silosToRetry[currentRetryIndex] };
        setReadingSilo(currentSilo.num);
        setSelectedSilo(currentSilo.num);
        
        const retryProgress = 100 + ((currentRetry - 1) * 30) + ((currentRetryIndex + 1) / silosToRetry.length) * 30;
        setAutoReadProgress(Math.min(130, retryProgress));

        try {
          clearSiloCache(currentSilo.num);
          const apiData = await fetchSiloDataWithRetry(currentSilo.num, 1, 300);
          
          const isStillDisconnected = apiData.siloColor === '#9ca3af' || apiData.sensors.every(temp => temp === 0);
          
          if (isStillDisconnected) {
            stillDisconnected.push(currentSilo.num);
          } else {
            console.log(`✅ [FAST RETRY] Silo ${currentSilo.num} connected!`);
            setSelectedTemp(apiData.maxTemp);
            markSiloCompleted(currentSilo.num);
            regenerateAllSiloData();
          }
          
          setDataVersion(prev => prev + 1);
          
        } catch (error) {
          stillDisconnected.push(currentSilo.num);
        }

        currentRetryIndex++;
      }, FAST_RETRY_INTERVAL);

      autoReadInterval.current = retryInterval;
    };
    
    runRetryForDisconnectedSilos(disconnectedSilosList);
  }, [maxRetries]);

  // Handle silo click
  const handleSiloClick = useCallback(async (siloNum: number, temp: number) => {
    if (readingMode === 'auto') {
      if (isSiloCompleted(siloNum)) {
        setSelectedSilo(siloNum);
        return;
      }
      
      try {
        clearSiloCache(siloNum);
        const apiData = await fetchSiloDataWithRetry(siloNum, 1, 300);
        markSiloCompleted(siloNum);
        setSelectedSilo(siloNum);
        setSelectedTemp(apiData.maxTemp);
        regenerateAllSiloData();
        setDataVersion(prev => prev + 1);
      } catch (error) {
        setSelectedSilo(siloNum);
      }
      return;
    }
    
    if (readingMode === 'manual' && !isReading) {
      startManualRead(siloNum, temp);
    } else if (readingMode === 'none') {
      try {
        clearSiloCache(siloNum);
        const apiData = await fetchSiloDataWithRetry(siloNum, 2, 500);
        setSelectedSilo(siloNum);
        setSelectedTemp(apiData.maxTemp);
        regenerateAllSiloData();
        setDataVersion(prev => prev + 1);
      } catch (error) {
        setSelectedSilo(siloNum);
        setSelectedTemp(temp);
      }
    }
  }, [readingMode, isReading]);

  // Handle silo hover
  const handleSiloHover = useCallback((siloNum: number, temp: number, event: React.MouseEvent) => {
    setHoveredSilo({ num: siloNum, temp: temp });
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  }, []);

  const handleSiloMouseMove = useCallback((event: React.MouseEvent) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  }, []);

  const handleSiloLeave = useCallback(() => {
    setHoveredSilo(null);
  }, []);

  // Start manual reading (fast version)
  const startManualRead = useCallback(async (siloNum: number, temp: number) => {
    setIsReading(true);
    setReadingSilo(siloNum);

    try {
      clearSiloCache(siloNum);
      const [apiData] = await Promise.all([
        fetchSiloDataWithRetry(siloNum, 2, 500),
        new Promise(resolve => setTimeout(resolve, FAST_TEST_INTERVAL))
      ]);

      setSelectedSilo(siloNum);
      setSelectedTemp(apiData.maxTemp);
      setIsReading(false);
      setReadingSilo(null);
      setDataVersion(prev => prev + 1);
      
    } catch (error) {
      setTimeout(() => {
        setSelectedSilo(siloNum);
        setSelectedTemp(temp);
        setIsReading(false);
        setReadingSilo(null);
      }, FAST_TEST_INTERVAL);
    }
  }, []);

  // Start/stop fast auto reading
  const startAutoRead = useCallback(() => {
    if (readingMode === 'auto') {
      // Stop fast test
      if (autoReadInterval.current) {
        clearInterval(autoReadInterval.current);
        autoReadInterval.current = null;
      }
      if (currentSiloTimeout.current) {
        clearTimeout(currentSiloTimeout.current);
        currentSiloTimeout.current = null;
      }
      
      clearAutoTestSensorState();
      setIsReading(false);
      setReadingSilo(null);
      setReadingMode('none');
      console.log(`⏹️ [FAST TEST] Stopped by user`);
      return;
    }

    // Start fresh fast test
    setReadingMode('auto');
    setIsReading(true);
    setAutoReadProgress(0);
    setAutoReadCompleted(false);
    setCurrentAutoTestIndex(0);
    setDisconnectedSilos([]);
    setRetryCount(0);
    setIsRetryPhase(false);

    const allSilos = getAllSilos();

    if (!allSilos || allSilos.length === 0) {
      console.error('No silos found');
      setIsReading(false);
      setReadingMode('none');
      return;
    }

    console.log(`⚡ [FAST TEST] Starting fresh test of ${allSilos.length} silos`);
    console.log(`⚡ [FAST TEST] Interval: ${FAST_TEST_INTERVAL}ms per silo`);
    console.log(`⚡ [FAST TEST] Estimated time: ${Math.ceil((allSilos.length * FAST_TEST_INTERVAL) / 1000 / 60)} minutes`);

    const startIndex = 0;
    const currentSilo = allSilos[startIndex];
    
    setReadingSilo(currentSilo.num);
    setSelectedSilo(currentSilo.num);
    setCurrentAutoTestIndex(startIndex);
    setAutoReadProgress(((startIndex + 1) / allSilos.length) * 100);
    setCurrentScanSilo(currentSilo.num);

    // Fetch first silo data
    const fetchFirstSiloData = async () => {
      try {
        clearSiloCache(currentSilo.num);
        const apiData = await fetchSiloDataWithRetry(currentSilo.num, 1, 300);
        setSelectedTemp(apiData.maxTemp);
        markSiloCompleted(currentSilo.num);
        regenerateAllSiloData();
        setDataVersion(prev => prev + 1);
      } catch (error) {
        setSelectedTemp(currentSilo.temp);
      }
    };
    
    fetchFirstSiloData();

    // Continue with rest of silos after 2 seconds
    currentSiloTimeout.current = setTimeout(() => {
      continueAutoTest(allSilos, startIndex + 1);
    }, FAST_TEST_INTERVAL);
  }, [readingMode, continueAutoTest]);

  // Handle manual read mode toggle
  const handleManualReadMode = useCallback(() => {
    if (readingMode === 'manual') {
      setReadingMode('none');
    } else {
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

  // Utility functions
  const isSiloReading = useCallback((siloNum: number): boolean => {
    return readingSilo === siloNum;
  }, [readingSilo]);

  const isSiloSelected = useCallback((siloNum: number): boolean => {
    return selectedSilo === siloNum;
  }, [selectedSilo]);

  const getSiloByNumber = useCallback((siloNum: number): Silo | null => {
    return findSiloByNumber(siloNum);
  }, []);

  const cleanup = useCallback(() => {
    if (autoReadInterval.current) {
      clearInterval(autoReadInterval.current);
      autoReadInterval.current = null;
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
    
    // Retry mechanism state
    disconnectedSilos,
    retryCount,
    isRetryPhase,
    maxRetries,

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

    // Direct setters
    setSelectedSilo,
    setSelectedTemp,
    setManualTestDuration,
  };
};
