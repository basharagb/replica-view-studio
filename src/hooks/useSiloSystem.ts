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
  const [readingMode, setReadingMode] = useState<ReadingMode>('none');
  const [isReading, setIsReading] = useState<boolean>(false);
  const [readingSilo, setReadingSilo] = useState<number | null>(null);
  const [autoReadProgress, setAutoReadProgress] = useState<number>(0);
  const [autoReadCompleted, setAutoReadCompleted] = useState<boolean>(false);
  const [dataVersion, setDataVersion] = useState<number>(0);
  const autoReadInterval = useRef<NodeJS.Timeout | null>(null);

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

    // Simulate reading delay
    setTimeout(() => {
      setSelectedSilo(siloNum);
      setSelectedTemp(temp);
      setIsReading(false);
      setReadingSilo(null);
    }, 1500); // 1.5 second reading simulation
  }, []);

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
    regenerateAllSiloData();
    setDataVersion(prev => prev + 1);
    
    setReadingMode('auto');
    setIsReading(true);
    setAutoReadProgress(0);
    setAutoReadCompleted(false);

    const allSilos = getAllSilos();
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex >= allSilos.length) {
        // Auto read complete
        clearInterval(interval);
        autoReadInterval.current = null;
        setIsReading(false);
        setReadingSilo(null);
        setAutoReadProgress(0);
        setReadingMode('none');
        setAutoReadCompleted(true);
        return;
      }

      const currentSilo = allSilos[currentIndex];
      setReadingSilo(currentSilo.num);
      setSelectedSilo(currentSilo.num);
      setSelectedTemp(currentSilo.temp);
      setAutoReadProgress(((currentIndex + 1) / allSilos.length) * 100);

      currentIndex++;
    }, 800); // 800ms per silo reading

    autoReadInterval.current = interval;
  }, [readingMode, isReading, autoReadCompleted]);

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
  };
};