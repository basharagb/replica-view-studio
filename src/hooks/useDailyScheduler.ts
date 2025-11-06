import { useState, useEffect, useRef, useCallback } from 'react';
import {
  DailyScheduleConfig,
  loadScheduleConfig,
  saveScheduleConfig,
  shouldStartAutoReadings,
  getNextScheduleInfo,
  NextScheduleInfo,
  isWithinScheduledTime
} from '../services/dailyScheduler';

interface DailySchedulerHook {
  scheduleConfig: DailyScheduleConfig;
  nextScheduleInfo: NextScheduleInfo;
  isScheduleActive: boolean;
  updateScheduleConfig: (config: Partial<DailyScheduleConfig>) => void;
  enableSchedule: () => void;
  disableSchedule: () => void;
  forceCheckSchedule: () => boolean;
}

export const useDailyScheduler = (
  onStartAutoReadings: () => void,
  onStopAutoReadings: () => void,
  isCurrentlyReading: boolean
): DailySchedulerHook => {
  const [scheduleConfig, setScheduleConfig] = useState<DailyScheduleConfig>(() => loadScheduleConfig());
  const [nextScheduleInfo, setNextScheduleInfo] = useState<NextScheduleInfo>(() => getNextScheduleInfo(scheduleConfig));
  const [isScheduleActive, setIsScheduleActive] = useState<boolean>(() => isWithinScheduledTime(scheduleConfig));
  
  const schedulerInterval = useRef<NodeJS.Timeout | null>(null);
  const lastScheduleCheck = useRef<number>(0);
  const wasInScheduleWindow = useRef<boolean>(false);

  // Update schedule configuration
  const updateScheduleConfig = useCallback((newConfig: Partial<DailyScheduleConfig>) => {
    const updatedConfig = { ...scheduleConfig, ...newConfig };
    setScheduleConfig(updatedConfig);
    saveScheduleConfig(updatedConfig);
    
    // Update next schedule info immediately
    const newNextInfo = getNextScheduleInfo(updatedConfig);
    setNextScheduleInfo(newNextInfo);
    setIsScheduleActive(isWithinScheduledTime(updatedConfig));
    
    console.log('📅 [SCHEDULER] Configuration updated:', updatedConfig);
  }, [scheduleConfig]);

  // Enable schedule
  const enableSchedule = useCallback(() => {
    updateScheduleConfig({ enabled: true });
  }, [updateScheduleConfig]);

  // Disable schedule
  const disableSchedule = useCallback(() => {
    updateScheduleConfig({ enabled: false });
  }, [updateScheduleConfig]);

  // Force check schedule (for manual testing)
  const forceCheckSchedule = useCallback((): boolean => {
    const shouldStart = shouldStartAutoReadings(scheduleConfig);
    console.log('📅 [SCHEDULER] Force check - Should start auto readings:', shouldStart);
    return shouldStart;
  }, [scheduleConfig]);

  // Main scheduler logic
  const checkSchedule = useCallback(() => {
    const now = Date.now();
    const currentConfig = scheduleConfig;
    
    // Only check every minute to avoid excessive processing
    if (now - lastScheduleCheck.current < 60000) {
      return;
    }
    
    lastScheduleCheck.current = now;
    
    const isInWindow = isWithinScheduledTime(currentConfig);
    const shouldStart = shouldStartAutoReadings(currentConfig);
    
    // Update state
    setIsScheduleActive(isInWindow);
    setNextScheduleInfo(getNextScheduleInfo(currentConfig));
    
    // Handle schedule transitions
    if (shouldStart && !wasInScheduleWindow.current && !isCurrentlyReading) {
      // Entering schedule window - start auto readings
      console.log('📅 [SCHEDULER] Entering scheduled reading window - starting auto readings');
      console.log('📅 [SCHEDULER] Current time:', new Date().toLocaleTimeString());
      console.log('📅 [SCHEDULER] Schedule:', `${currentConfig.startHour}:${currentConfig.startMinute.toString().padStart(2, '0')} - ${currentConfig.endHour}:${currentConfig.endMinute.toString().padStart(2, '0')}`);
      
      onStartAutoReadings();
      wasInScheduleWindow.current = true;
      
    } else if (!isInWindow && wasInScheduleWindow.current && isCurrentlyReading) {
      // Exiting schedule window - stop auto readings
      console.log('📅 [SCHEDULER] Exiting scheduled reading window - stopping auto readings');
      console.log('📅 [SCHEDULER] Current time:', new Date().toLocaleTimeString());
      
      onStopAutoReadings();
      wasInScheduleWindow.current = false;
      
    } else if (!isInWindow) {
      // Not in window
      wasInScheduleWindow.current = false;
    }
    
    // Log next schedule info every 10 minutes for monitoring
    const minutes = new Date().getMinutes();
    if (minutes % 10 === 0 && new Date().getSeconds() < 30) {
      const nextInfo = getNextScheduleInfo(currentConfig);
      if (nextInfo.minutesUntilNext > 0) {
        const hoursUntil = Math.floor(nextInfo.minutesUntilNext / 60);
        const minutesUntil = nextInfo.minutesUntilNext % 60;
        console.log(`📅 [SCHEDULER] Next ${nextInfo.nextEventType} in ${hoursUntil}h ${minutesUntil}m at ${nextInfo.nextEventTime}`);
      }
    }
    
  }, [scheduleConfig, onStartAutoReadings, onStopAutoReadings, isCurrentlyReading]);

  // Initialize scheduler on mount and when config changes
  useEffect(() => {
    // Clear existing interval
    if (schedulerInterval.current) {
      clearInterval(schedulerInterval.current);
    }
    
    // Initial check
    checkSchedule();
    
    // Set up interval to check every 30 seconds
    schedulerInterval.current = setInterval(checkSchedule, 30000);
    
    console.log('📅 [SCHEDULER] Daily scheduler initialized');
    console.log('📅 [SCHEDULER] Current config:', scheduleConfig);
    console.log('📅 [SCHEDULER] Current time:', new Date().toLocaleTimeString());
    
    // Cleanup on unmount or config change
    return () => {
      if (schedulerInterval.current) {
        clearInterval(schedulerInterval.current);
        schedulerInterval.current = null;
      }
    };
  }, [checkSchedule]);

  // Update next schedule info every minute
  useEffect(() => {
    const updateInterval = setInterval(() => {
      setNextScheduleInfo(getNextScheduleInfo(scheduleConfig));
    }, 60000); // Update every minute
    
    return () => clearInterval(updateInterval);
  }, [scheduleConfig]);

  // Log scheduler status on startup
  useEffect(() => {
    const currentTime = new Date();
    const timeString = currentTime.toLocaleTimeString();
    const dateString = currentTime.toLocaleDateString();
    
    console.log('📅 [SCHEDULER] === DAILY SCHEDULER STATUS ===');
    console.log('📅 [SCHEDULER] Current Date/Time:', `${dateString} ${timeString}`);
    console.log('📅 [SCHEDULER] Schedule Enabled:', scheduleConfig.enabled);
    console.log('📅 [SCHEDULER] Schedule Window:', `${scheduleConfig.startHour}:${scheduleConfig.startMinute.toString().padStart(2, '0')} - ${scheduleConfig.endHour}:${scheduleConfig.endMinute.toString().padStart(2, '0')}`);
    console.log('📅 [SCHEDULER] Currently In Window:', isScheduleActive);
    console.log('📅 [SCHEDULER] Next Event:', `${nextScheduleInfo.nextEventType} at ${nextScheduleInfo.nextEventTime}`);
    
    if (nextScheduleInfo.minutesUntilNext > 0) {
      const hoursUntil = Math.floor(nextScheduleInfo.minutesUntilNext / 60);
      const minutesUntil = nextScheduleInfo.minutesUntilNext % 60;
      console.log('📅 [SCHEDULER] Time Until Next Event:', `${hoursUntil}h ${minutesUntil}m`);
    }
    
    console.log('📅 [SCHEDULER] ================================');
  }, []);

  return {
    scheduleConfig,
    nextScheduleInfo,
    isScheduleActive,
    updateScheduleConfig,
    enableSchedule,
    disableSchedule,
    forceCheckSchedule
  };
};
