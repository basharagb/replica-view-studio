// Daily Auto Reading Scheduler Service
// Automatically starts auto readings every day from 6:00 AM to 7:00 AM

export interface DailyScheduleConfig {
  enabled: boolean;
  startHour: number;  // 0-23 (24-hour format)
  startMinute: number; // 0-59
  endHour: number;    // 0-23 (24-hour format)
  endMinute: number;  // 0-59
  timezone: string;   // e.g., 'UTC+03:00'
}

const SCHEDULE_STORAGE_KEY = 'replica-view-studio-daily-schedule';

// Default schedule: 6:00 AM to 7:00 AM daily
const DEFAULT_SCHEDULE: DailyScheduleConfig = {
  enabled: true,
  startHour: 6,
  startMinute: 0,
  endHour: 7,
  endMinute: 0,
  timezone: 'UTC+03:00'
};

// Save schedule configuration to localStorage
export const saveScheduleConfig = (config: DailyScheduleConfig): void => {
  try {
    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(config));
    console.log('📅 [SCHEDULER] Schedule configuration saved:', config);
  } catch (error) {
    console.warn('Failed to save schedule configuration:', error);
  }
};

// Load schedule configuration from localStorage
export const loadScheduleConfig = (): DailyScheduleConfig => {
  try {
    const saved = localStorage.getItem(SCHEDULE_STORAGE_KEY);
    if (saved) {
      const config = JSON.parse(saved);
      console.log('📅 [SCHEDULER] Schedule configuration loaded:', config);
      return config;
    }
  } catch (error) {
    console.warn('Failed to load schedule configuration:', error);
  }
  
  // Return default schedule and save it
  console.log('📅 [SCHEDULER] Using default schedule configuration');
  saveScheduleConfig(DEFAULT_SCHEDULE);
  return DEFAULT_SCHEDULE;
};

// Check if current time is within the scheduled reading window
export const isWithinScheduledTime = (config: DailyScheduleConfig): boolean => {
  if (!config.enabled) {
    return false;
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Convert times to minutes for easier comparison
  const currentTimeMinutes = currentHour * 60 + currentMinute;
  const startTimeMinutes = config.startHour * 60 + config.startMinute;
  const endTimeMinutes = config.endHour * 60 + config.endMinute;
  
  // Handle case where end time is next day (e.g., 23:00 to 01:00)
  if (endTimeMinutes <= startTimeMinutes) {
    // Schedule spans midnight
    return currentTimeMinutes >= startTimeMinutes || currentTimeMinutes < endTimeMinutes;
  } else {
    // Normal schedule within same day
    return currentTimeMinutes >= startTimeMinutes && currentTimeMinutes < endTimeMinutes;
  }
};

// Get time until next scheduled reading window starts
export const getTimeUntilNextSchedule = (config: DailyScheduleConfig): number => {
  if (!config.enabled) {
    return -1; // Disabled
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;
  const startTimeMinutes = config.startHour * 60 + config.startMinute;
  
  let minutesUntilStart: number;
  
  if (currentTimeMinutes < startTimeMinutes) {
    // Same day
    minutesUntilStart = startTimeMinutes - currentTimeMinutes;
  } else {
    // Next day
    minutesUntilStart = (24 * 60) - currentTimeMinutes + startTimeMinutes;
  }
  
  return minutesUntilStart;
};

// Format time for display
export const formatScheduleTime = (hour: number, minute: number): string => {
  const h = hour.toString().padStart(2, '0');
  const m = minute.toString().padStart(2, '0');
  return `${h}:${m}`;
};

// Get human-readable schedule description
export const getScheduleDescription = (config: DailyScheduleConfig): string => {
  if (!config.enabled) {
    return 'Automatic daily schedule is disabled';
  }
  
  const startTime = formatScheduleTime(config.startHour, config.startMinute);
  const endTime = formatScheduleTime(config.endHour, config.endMinute);
  
  return `Daily auto readings: ${startTime} - ${endTime}`;
};

// Check if we should start auto readings now
export const shouldStartAutoReadings = (config: DailyScheduleConfig): boolean => {
  return config.enabled && isWithinScheduledTime(config);
};

// Get next schedule event info
export interface NextScheduleInfo {
  isActive: boolean;
  nextEventType: 'start' | 'end';
  minutesUntilNext: number;
  nextEventTime: string;
}

export const getNextScheduleInfo = (config: DailyScheduleConfig): NextScheduleInfo => {
  if (!config.enabled) {
    return {
      isActive: false,
      nextEventType: 'start',
      minutesUntilNext: -1,
      nextEventTime: 'Disabled'
    };
  }

  const isActive = isWithinScheduledTime(config);
  
  if (isActive) {
    // Currently in reading window, calculate time until end
    const now = new Date();
    const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
    const endTimeMinutes = config.endHour * 60 + config.endMinute;
    
    let minutesUntilEnd: number;
    if (endTimeMinutes <= config.startHour * 60 + config.startMinute) {
      // End time is next day
      if (currentTimeMinutes >= config.startHour * 60 + config.startMinute) {
        // Same day, end is tomorrow
        minutesUntilEnd = (24 * 60) - currentTimeMinutes + endTimeMinutes;
      } else {
        // Already past midnight, end is today
        minutesUntilEnd = endTimeMinutes - currentTimeMinutes;
      }
    } else {
      // End time is same day
      minutesUntilEnd = endTimeMinutes - currentTimeMinutes;
    }
    
    return {
      isActive: true,
      nextEventType: 'end',
      minutesUntilNext: minutesUntilEnd,
      nextEventTime: formatScheduleTime(config.endHour, config.endMinute)
    };
  } else {
    // Not in reading window, calculate time until start
    const minutesUntilStart = getTimeUntilNextSchedule(config);
    
    return {
      isActive: false,
      nextEventType: 'start',
      minutesUntilNext: minutesUntilStart,
      nextEventTime: formatScheduleTime(config.startHour, config.startMinute)
    };
  }
};

// Validate schedule configuration
export const validateScheduleConfig = (config: Partial<DailyScheduleConfig>): string[] => {
  const errors: string[] = [];
  
  if (config.startHour !== undefined && (config.startHour < 0 || config.startHour > 23)) {
    errors.push('Start hour must be between 0 and 23');
  }
  
  if (config.startMinute !== undefined && (config.startMinute < 0 || config.startMinute > 59)) {
    errors.push('Start minute must be between 0 and 59');
  }
  
  if (config.endHour !== undefined && (config.endHour < 0 || config.endHour > 23)) {
    errors.push('End hour must be between 0 and 23');
  }
  
  if (config.endMinute !== undefined && (config.endMinute < 0 || config.endMinute > 59)) {
    errors.push('End minute must be between 0 and 59');
  }
  
  return errors;
};
