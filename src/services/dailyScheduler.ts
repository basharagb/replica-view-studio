// Daily Auto Reading Scheduler Service
// Supports multiple daily schedules with individual enable/disable controls

export interface DailyScheduleConfig {
  id: string;         // Unique identifier
  name: string;       // User-friendly name
  enabled: boolean;
  startHour: number;  // 0-23 (24-hour format)
  startMinute: number; // 0-59
  endHour: number;    // 0-23 (24-hour format)
  endMinute: number;  // 0-59
  timezone: string;   // e.g., 'UTC+03:00'
  createdAt: number;  // Timestamp
}

export interface MultipleSchedulesConfig {
  schedules: DailyScheduleConfig[];
  globalEnabled: boolean; // Master switch for all schedules
}

const SCHEDULES_STORAGE_KEY = 'replica-view-studio-multiple-schedules';

// Default schedules
const DEFAULT_SCHEDULES: MultipleSchedulesConfig = {
  globalEnabled: true,
  schedules: [
    {
      id: 'morning-schedule',
      name: 'Morning Reading',
      enabled: true,
      startHour: 6,
      startMinute: 0,
      endHour: 7,
      endMinute: 0,
      timezone: 'UTC+03:00',
      createdAt: Date.now()
    }
  ]
};

// Generate unique ID for new schedules
export const generateScheduleId = (): string => {
  return `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Save multiple schedules configuration to localStorage
export const saveSchedulesConfig = (config: MultipleSchedulesConfig): void => {
  try {
    localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(config));
    console.log('📅 [SCHEDULER] Multiple schedules configuration saved:', config);
  } catch (error) {
    console.warn('Failed to save schedules configuration:', error);
  }
};

// Load multiple schedules configuration from localStorage
export const loadSchedulesConfig = (): MultipleSchedulesConfig => {
  try {
    const saved = localStorage.getItem(SCHEDULES_STORAGE_KEY);
    if (saved) {
      const config = JSON.parse(saved);
      console.log('📅 [SCHEDULER] Multiple schedules configuration loaded:', config);
      return config;
    }
  } catch (error) {
    console.warn('Failed to load schedules configuration:', error);
  }
  
  // Return default schedules and save them
  console.log('📅 [SCHEDULER] Using default schedules configuration');
  saveSchedulesConfig(DEFAULT_SCHEDULES);
  return DEFAULT_SCHEDULES;
};

// Legacy support: Load old single schedule and migrate to multiple schedules
export const migrateFromSingleSchedule = (): MultipleSchedulesConfig => {
  try {
    const oldScheduleKey = 'replica-view-studio-daily-schedule';
    const saved = localStorage.getItem(oldScheduleKey);
    if (saved) {
      const oldConfig = JSON.parse(saved);
      console.log('📅 [SCHEDULER] Migrating from single schedule:', oldConfig);
      
      const migratedConfig: MultipleSchedulesConfig = {
        globalEnabled: true,
        schedules: [
          {
            id: 'migrated-schedule',
            name: 'Migrated Schedule',
            enabled: oldConfig.enabled,
            startHour: oldConfig.startHour,
            startMinute: oldConfig.startMinute,
            endHour: oldConfig.endHour,
            endMinute: oldConfig.endMinute,
            timezone: oldConfig.timezone || 'UTC+03:00',
            createdAt: Date.now()
          }
        ]
      };
      
      // Save migrated config and remove old key
      saveSchedulesConfig(migratedConfig);
      localStorage.removeItem(oldScheduleKey);
      
      return migratedConfig;
    }
  } catch (error) {
    console.warn('Failed to migrate from single schedule:', error);
  }
  
  return loadSchedulesConfig();
};

// Check if current time is within any active scheduled reading window
export const isWithinAnyScheduledTime = (config: MultipleSchedulesConfig): boolean => {
  if (!config.globalEnabled) {
    return false;
  }

  return config.schedules.some(schedule => isWithinScheduledTime(schedule));
};

// Check if current time is within a specific scheduled reading window
export const isWithinScheduledTime = (schedule: DailyScheduleConfig): boolean => {
  if (!schedule.enabled) {
    return false;
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Convert times to minutes for easier comparison
  const currentTimeMinutes = currentHour * 60 + currentMinute;
  const startTimeMinutes = schedule.startHour * 60 + schedule.startMinute;
  const endTimeMinutes = schedule.endHour * 60 + schedule.endMinute;
  
  // Handle case where end time is next day (e.g., 23:00 to 01:00)
  if (endTimeMinutes <= startTimeMinutes) {
    // Schedule spans midnight
    return currentTimeMinutes >= startTimeMinutes || currentTimeMinutes < endTimeMinutes;
  } else {
    // Normal schedule within same day
    return currentTimeMinutes >= startTimeMinutes && currentTimeMinutes < endTimeMinutes;
  }
};

// Get all currently active schedules
export const getActiveSchedules = (config: MultipleSchedulesConfig): DailyScheduleConfig[] => {
  if (!config.globalEnabled) {
    return [];
  }

  return config.schedules.filter(schedule => 
    schedule.enabled && isWithinScheduledTime(schedule)
  );
};

// Get time until next scheduled reading window starts (any schedule)
export const getTimeUntilNextSchedule = (config: MultipleSchedulesConfig): { minutes: number; schedule: DailyScheduleConfig | null } => {
  if (!config.globalEnabled || config.schedules.length === 0) {
    return { minutes: -1, schedule: null }; // Disabled or no schedules
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;
  
  let nextSchedule: DailyScheduleConfig | null = null;
  let minMinutesUntilStart = Infinity;
  
  // Check all enabled schedules
  config.schedules.forEach(schedule => {
    if (!schedule.enabled) return;
    
    const startTimeMinutes = schedule.startHour * 60 + schedule.startMinute;
    let minutesUntilStart: number;
    
    if (currentTimeMinutes < startTimeMinutes) {
      // Same day
      minutesUntilStart = startTimeMinutes - currentTimeMinutes;
    } else {
      // Next day
      minutesUntilStart = (24 * 60) - currentTimeMinutes + startTimeMinutes;
    }
    
    if (minutesUntilStart < minMinutesUntilStart) {
      minMinutesUntilStart = minutesUntilStart;
      nextSchedule = schedule;
    }
  });
  
  return {
    minutes: minMinutesUntilStart === Infinity ? -1 : minMinutesUntilStart,
    schedule: nextSchedule
  };
};

// Get time until specific schedule starts
export const getTimeUntilSpecificSchedule = (schedule: DailyScheduleConfig): number => {
  if (!schedule.enabled) {
    return -1; // Disabled
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;
  const startTimeMinutes = schedule.startHour * 60 + schedule.startMinute;
  
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

// Get human-readable schedule description for single schedule
export const getScheduleDescription = (schedule: DailyScheduleConfig): string => {
  if (!schedule.enabled) {
    return `${schedule.name}: Disabled`;
  }
  
  const startTime = formatScheduleTime(schedule.startHour, schedule.startMinute);
  const endTime = formatScheduleTime(schedule.endHour, schedule.endMinute);
  
  return `${schedule.name}: ${startTime} - ${endTime}`;
};

// Get human-readable description for all schedules
export const getAllSchedulesDescription = (config: MultipleSchedulesConfig): string => {
  if (!config.globalEnabled) {
    return 'All daily schedules are disabled';
  }
  
  const enabledSchedules = config.schedules.filter(s => s.enabled);
  if (enabledSchedules.length === 0) {
    return 'No active schedules';
  }
  
  if (enabledSchedules.length === 1) {
    const schedule = enabledSchedules[0];
    const startTime = formatScheduleTime(schedule.startHour, schedule.startMinute);
    const endTime = formatScheduleTime(schedule.endHour, schedule.endMinute);
    return `Daily auto readings: ${startTime} - ${endTime}`;
  }
  
  return `${enabledSchedules.length} active schedules`;
};

// Check if we should start auto readings now (any schedule)
export const shouldStartAutoReadings = (config: MultipleSchedulesConfig): boolean => {
  return config.globalEnabled && isWithinAnyScheduledTime(config);
};

// Check if specific schedule should start auto readings now
export const shouldStartAutoReadingsForSchedule = (schedule: DailyScheduleConfig): boolean => {
  return schedule.enabled && isWithinScheduledTime(schedule);
};

// Get next schedule event info
export interface NextScheduleInfo {
  isActive: boolean;
  nextEventType: 'start' | 'end';
  minutesUntilNext: number;
  nextEventTime: string;
  scheduleName: string;
}

export const getNextScheduleInfo = (config: MultipleSchedulesConfig): NextScheduleInfo => {
  if (!config.globalEnabled || config.schedules.length === 0) {
    return {
      isActive: false,
      nextEventType: 'start',
      minutesUntilNext: -1,
      nextEventTime: 'Disabled',
      scheduleName: ''
    };
  }

  const activeSchedules = getActiveSchedules(config);
  const isActive = activeSchedules.length > 0;
  
  if (isActive) {
    // Currently in reading window, find the earliest end time
    const now = new Date();
    const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
    
    let earliestEndMinutes = Infinity;
    let earliestEndSchedule: DailyScheduleConfig | null = null;
    
    activeSchedules.forEach(schedule => {
      const endTimeMinutes = schedule.endHour * 60 + schedule.endMinute;
      let minutesUntilEnd: number;
      
      if (endTimeMinutes <= schedule.startHour * 60 + schedule.startMinute) {
        // End time is next day
        if (currentTimeMinutes >= schedule.startHour * 60 + schedule.startMinute) {
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
      
      if (minutesUntilEnd < earliestEndMinutes) {
        earliestEndMinutes = minutesUntilEnd;
        earliestEndSchedule = schedule;
      }
    });
    
    return {
      isActive: true,
      nextEventType: 'end',
      minutesUntilNext: earliestEndMinutes === Infinity ? -1 : earliestEndMinutes,
      nextEventTime: earliestEndSchedule ? formatScheduleTime(earliestEndSchedule.endHour, earliestEndSchedule.endMinute) : 'Unknown',
      scheduleName: earliestEndSchedule?.name || ''
    };
  } else {
    // Not in reading window, find next start time
    const nextInfo = getTimeUntilNextSchedule(config);
    
    return {
      isActive: false,
      nextEventType: 'start',
      minutesUntilNext: nextInfo.minutes,
      nextEventTime: nextInfo.schedule ? formatScheduleTime(nextInfo.schedule.startHour, nextInfo.schedule.startMinute) : 'None',
      scheduleName: nextInfo.schedule?.name || ''
    };
  }
};

// Schedule management functions
export const addSchedule = (config: MultipleSchedulesConfig, newSchedule: Omit<DailyScheduleConfig, 'id' | 'createdAt'>): MultipleSchedulesConfig => {
  const schedule: DailyScheduleConfig = {
    ...newSchedule,
    id: generateScheduleId(),
    createdAt: Date.now()
  };
  
  const updatedConfig = {
    ...config,
    schedules: [...config.schedules, schedule]
  };
  
  saveSchedulesConfig(updatedConfig);
  return updatedConfig;
};

export const updateSchedule = (config: MultipleSchedulesConfig, scheduleId: string, updates: Partial<DailyScheduleConfig>): MultipleSchedulesConfig => {
  const updatedConfig = {
    ...config,
    schedules: config.schedules.map(schedule => 
      schedule.id === scheduleId ? { ...schedule, ...updates } : schedule
    )
  };
  
  saveSchedulesConfig(updatedConfig);
  return updatedConfig;
};

export const deleteSchedule = (config: MultipleSchedulesConfig, scheduleId: string): MultipleSchedulesConfig => {
  const updatedConfig = {
    ...config,
    schedules: config.schedules.filter(schedule => schedule.id !== scheduleId)
  };
  
  saveSchedulesConfig(updatedConfig);
  return updatedConfig;
};

export const toggleSchedule = (config: MultipleSchedulesConfig, scheduleId: string): MultipleSchedulesConfig => {
  return updateSchedule(config, scheduleId, { 
    enabled: !config.schedules.find(s => s.id === scheduleId)?.enabled 
  });
};

export const toggleGlobalSchedules = (config: MultipleSchedulesConfig): MultipleSchedulesConfig => {
  const updatedConfig = {
    ...config,
    globalEnabled: !config.globalEnabled
  };
  
  saveSchedulesConfig(updatedConfig);
  return updatedConfig;
};

// Validate schedule configuration
export const validateScheduleConfig = (config: Partial<DailyScheduleConfig>): string[] => {
  const errors: string[] = [];
  
  if (config.name !== undefined && config.name.trim().length === 0) {
    errors.push('Schedule name cannot be empty');
  }
  
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

// Check for schedule conflicts
export const checkScheduleConflicts = (config: MultipleSchedulesConfig, excludeId?: string): string[] => {
  const conflicts: string[] = [];
  const activeSchedules = config.schedules.filter(s => s.enabled && s.id !== excludeId);
  
  for (let i = 0; i < activeSchedules.length; i++) {
    for (let j = i + 1; j < activeSchedules.length; j++) {
      const schedule1 = activeSchedules[i];
      const schedule2 = activeSchedules[j];
      
      if (schedulesOverlap(schedule1, schedule2)) {
        conflicts.push(`"${schedule1.name}" conflicts with "${schedule2.name}"`);
      }
    }
  }
  
  return conflicts;
};

// Check if two schedules overlap
const schedulesOverlap = (schedule1: DailyScheduleConfig, schedule2: DailyScheduleConfig): boolean => {
  const start1 = schedule1.startHour * 60 + schedule1.startMinute;
  const end1 = schedule1.endHour * 60 + schedule1.endMinute;
  const start2 = schedule2.startHour * 60 + schedule2.startMinute;
  const end2 = schedule2.endHour * 60 + schedule2.endMinute;
  
  // Handle schedules that span midnight
  const spans1 = end1 <= start1;
  const spans2 = end2 <= start2;
  
  if (!spans1 && !spans2) {
    // Both schedules are within the same day
    return !(end1 <= start2 || end2 <= start1);
  }
  
  // At least one schedule spans midnight - more complex logic needed
  // For simplicity, we'll consider them as potentially conflicting
  return true;
};
