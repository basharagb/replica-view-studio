import { useState, useEffect, useRef, useCallback } from 'react';
import {
  DailyScheduleConfig,
  MultipleSchedulesConfig,
  loadSchedulesConfig,
  migrateFromSingleSchedule,
  saveSchedulesConfig,
  shouldStartAutoReadings,
  getNextScheduleInfo,
  NextScheduleInfo,
  isWithinAnyScheduledTime,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  toggleSchedule,
  toggleGlobalSchedules,
  validateScheduleConfig,
  checkScheduleConflicts,
  getAllSchedulesDescription
} from '../services/dailyScheduler';

interface DailySchedulerHook {
  schedulesConfig: MultipleSchedulesConfig;
  nextScheduleInfo: NextScheduleInfo;
  isScheduleActive: boolean;
  
  // Global controls
  toggleGlobal: () => void;
  
  // Schedule management
  addNewSchedule: (schedule: Omit<DailyScheduleConfig, 'id' | 'createdAt'>) => void;
  updateScheduleById: (id: string, updates: Partial<DailyScheduleConfig>) => void;
  deleteScheduleById: (id: string) => void;
  toggleScheduleById: (id: string) => void;
  
  // Validation
  validateSchedule: (config: Partial<DailyScheduleConfig>) => string[];
  checkConflicts: (excludeId?: string) => string[];
  
  // Legacy support
  forceCheckSchedule: () => boolean;
}

export const useDailyScheduler = (
  onStartAutoReadings: () => void,
  onStopAutoReadings: () => void,
  isCurrentlyReading: boolean
): DailySchedulerHook => {
  // Initialize with migration support
  const [schedulesConfig, setSchedulesConfig] = useState<MultipleSchedulesConfig>(() => {
    // Try to migrate from old single schedule first
    const migrated = migrateFromSingleSchedule();
    return migrated;
  });
  
  const [nextScheduleInfo, setNextScheduleInfo] = useState<NextScheduleInfo>(() => getNextScheduleInfo(schedulesConfig));
  const [isScheduleActive, setIsScheduleActive] = useState<boolean>(() => isWithinAnyScheduledTime(schedulesConfig));
  
  const schedulerInterval = useRef<NodeJS.Timeout | null>(null);
  const lastScheduleCheck = useRef<number>(0);
  const wasInScheduleWindow = useRef<boolean>(false);

  // Global controls
  const toggleGlobal = useCallback(() => {
    const updatedConfig = toggleGlobalSchedules(schedulesConfig);
    setSchedulesConfig(updatedConfig);
    
    // Update next schedule info immediately
    const newNextInfo = getNextScheduleInfo(updatedConfig);
    setNextScheduleInfo(newNextInfo);
    setIsScheduleActive(isWithinAnyScheduledTime(updatedConfig));
    
    console.log('📅 [SCHEDULER] Global schedules toggled:', updatedConfig.globalEnabled);
  }, [schedulesConfig]);
  
  // Schedule management
  const addNewSchedule = useCallback((newSchedule: Omit<DailyScheduleConfig, 'id' | 'createdAt'>) => {
    const updatedConfig = addSchedule(schedulesConfig, newSchedule);
    setSchedulesConfig(updatedConfig);
    
    // Update next schedule info immediately
    const newNextInfo = getNextScheduleInfo(updatedConfig);
    setNextScheduleInfo(newNextInfo);
    setIsScheduleActive(isWithinAnyScheduledTime(updatedConfig));
    
    console.log('📅 [SCHEDULER] New schedule added:', newSchedule.name);
  }, [schedulesConfig]);
  
  const updateScheduleById = useCallback((id: string, updates: Partial<DailyScheduleConfig>) => {
    const updatedConfig = updateSchedule(schedulesConfig, id, updates);
    setSchedulesConfig(updatedConfig);
    
    // Update next schedule info immediately
    const newNextInfo = getNextScheduleInfo(updatedConfig);
    setNextScheduleInfo(newNextInfo);
    setIsScheduleActive(isWithinAnyScheduledTime(updatedConfig));
    
    console.log('📅 [SCHEDULER] Schedule updated:', id, updates);
  }, [schedulesConfig]);
  
  const deleteScheduleById = useCallback((id: string) => {
    const updatedConfig = deleteSchedule(schedulesConfig, id);
    setSchedulesConfig(updatedConfig);
    
    // Update next schedule info immediately
    const newNextInfo = getNextScheduleInfo(updatedConfig);
    setNextScheduleInfo(newNextInfo);
    setIsScheduleActive(isWithinAnyScheduledTime(updatedConfig));
    
    console.log('📅 [SCHEDULER] Schedule deleted:', id);
  }, [schedulesConfig]);
  
  const toggleScheduleById = useCallback((id: string) => {
    const updatedConfig = toggleSchedule(schedulesConfig, id);
    setSchedulesConfig(updatedConfig);
    
    // Update next schedule info immediately
    const newNextInfo = getNextScheduleInfo(updatedConfig);
    setNextScheduleInfo(newNextInfo);
    setIsScheduleActive(isWithinAnyScheduledTime(updatedConfig));
    
    const schedule = updatedConfig.schedules.find(s => s.id === id);
    console.log('📅 [SCHEDULER] Schedule toggled:', schedule?.name, schedule?.enabled);
  }, [schedulesConfig]);
  
  // Validation
  const validateSchedule = useCallback((config: Partial<DailyScheduleConfig>) => {
    return validateScheduleConfig(config);
  }, []);
  
  const checkConflicts = useCallback((excludeId?: string) => {
    return checkScheduleConflicts(schedulesConfig, excludeId);
  }, [schedulesConfig]);

  // Force check schedule (for manual testing)
  const forceCheckSchedule = useCallback((): boolean => {
    const shouldStart = shouldStartAutoReadings(schedulesConfig);
    console.log('📅 [SCHEDULER] Force check - Should start auto readings:', shouldStart);
    return shouldStart;
  }, [schedulesConfig]);

  // Main scheduler logic
  const checkSchedule = useCallback(() => {
    const now = Date.now();
    const currentConfig = schedulesConfig;
    
    // Only check every minute to avoid excessive processing
    if (now - lastScheduleCheck.current < 60000) {
      return;
    }
    
    lastScheduleCheck.current = now;
    
    const isInWindow = isWithinAnyScheduledTime(currentConfig);
    const shouldStart = shouldStartAutoReadings(currentConfig);
    
    // Update state
    setIsScheduleActive(isInWindow);
    setNextScheduleInfo(getNextScheduleInfo(currentConfig));
    
    // Handle schedule transitions
    if (shouldStart && !wasInScheduleWindow.current && !isCurrentlyReading) {
      // Entering schedule window - start auto readings
      console.log('📅 [SCHEDULER] Entering scheduled reading window - starting auto readings');
      console.log('📅 [SCHEDULER] Current time:', new Date().toLocaleTimeString());
      console.log('📅 [SCHEDULER] Active schedules:', currentConfig.schedules.filter(s => s.enabled).length);
      
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
        console.log(`📅 [SCHEDULER] Next ${nextInfo.nextEventType} (${nextInfo.scheduleName}) in ${hoursUntil}h ${minutesUntil}m at ${nextInfo.nextEventTime}`);
      }
    }
    
  }, [schedulesConfig, onStartAutoReadings, onStopAutoReadings, isCurrentlyReading]);

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
    
    console.log('📅 [SCHEDULER] Multiple schedules initialized');
    console.log('📅 [SCHEDULER] Current config:', schedulesConfig);
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
      setNextScheduleInfo(getNextScheduleInfo(schedulesConfig));
    }, 60000); // Update every minute
    
    return () => clearInterval(updateInterval);
  }, [schedulesConfig]);

  // Log scheduler status on startup
  useEffect(() => {
    const currentTime = new Date();
    const timeString = currentTime.toLocaleTimeString();
    const dateString = currentTime.toLocaleDateString();
    
    console.log('📅 [SCHEDULER] === MULTIPLE SCHEDULES STATUS ===');
    console.log('📅 [SCHEDULER] Current Date/Time:', `${dateString} ${timeString}`);
    console.log('📅 [SCHEDULER] Global Enabled:', schedulesConfig.globalEnabled);
    console.log('📅 [SCHEDULER] Total Schedules:', schedulesConfig.schedules.length);
    console.log('📅 [SCHEDULER] Active Schedules:', schedulesConfig.schedules.filter(s => s.enabled).length);
    console.log('📅 [SCHEDULER] Currently In Window:', isScheduleActive);
    console.log('📅 [SCHEDULER] Next Event:', `${nextScheduleInfo.nextEventType} (${nextScheduleInfo.scheduleName}) at ${nextScheduleInfo.nextEventTime}`);
    
    if (nextScheduleInfo.minutesUntilNext > 0) {
      const hoursUntil = Math.floor(nextScheduleInfo.minutesUntilNext / 60);
      const minutesUntil = nextScheduleInfo.minutesUntilNext % 60;
      console.log('📅 [SCHEDULER] Time Until Next Event:', `${hoursUntil}h ${minutesUntil}m`);
    }
    
    // Log individual schedules
    schedulesConfig.schedules.forEach((schedule, index) => {
      console.log(`📅 [SCHEDULER] Schedule ${index + 1}: "${schedule.name}" (${schedule.enabled ? 'Enabled' : 'Disabled'}) ${schedule.startHour}:${schedule.startMinute.toString().padStart(2, '0')}-${schedule.endHour}:${schedule.endMinute.toString().padStart(2, '0')}`);
    });
    
    console.log('📅 [SCHEDULER] =====================================');
  }, []);

  return {
    schedulesConfig,
    nextScheduleInfo,
    isScheduleActive,
    
    // Global controls
    toggleGlobal,
    
    // Schedule management
    addNewSchedule,
    updateScheduleById,
    deleteScheduleById,
    toggleScheduleById,
    
    // Validation
    validateSchedule,
    checkConflicts,
    
    // Legacy support
    forceCheckSchedule
  };
};
