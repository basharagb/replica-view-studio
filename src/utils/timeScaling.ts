import { differenceInDays, format } from 'date-fns';

/**
 * Comprehensive Dynamic Time Scaling System
 *
 * CORE RULE: All graphs must display exactly 24 horizontal time steps
 * MATHEMATICAL FORMULA: hoursPerStep = selectedDays
 *
 * Examples:
 * - 1 day → 24 steps × 1 hour each = 24 hours total (00h, 01h, 02h, ..., 23h)
 * - 2 days → 24 steps × 2 hours each = 48 hours total (00h, 02h, 04h, ..., 46h)
 * - 3 days → 24 steps × 3 hours each = 72 hours total (00h, 03h, 06h, ..., 69h)
 * - 6 days → 24 steps × 6 hours each = 144 hours total
 * - 12 days → 24 steps × 12 hours each = 288 hours total
 * - 24 days → 24 steps × 24 hours each = 576 hours total (daily intervals)
 */

export interface TimeScaleConfig {
  dataPoints: number;        // Always 24
  hoursPerStep: number;      // selectedDays (hours represented by each step)
  timeInterval: number;      // Milliseconds between data points
  timeFormat: string;        // Format string for time labels
  stepDescription: string;   // Human-readable description
  selectedDays: number;      // Input days (1-24)
  totalHours: number;        // Total time coverage in hours
  startTime: Date;           // Calculated start time (rounded to hour)
  endTime: Date;             // Calculated end time (rounded to hour)
}

/**
 * Calculate dynamic time scaling configuration using the mathematical formula
 * @param selectedDays - Number of days to display (1-24)
 * @param endTime - Optional end time (defaults to current time rounded down to hour)
 * @returns TimeScaleConfig object with scaling parameters
 */
export const calculateTimeScale = (selectedDays: number, endTime?: Date): TimeScaleConfig => {
  // Clamp selectedDays to valid range [1, 24]
  const clampedDays = Math.max(1, Math.min(24, Math.floor(selectedDays)));

  if (clampedDays !== selectedDays) {
    console.warn(`TimeScaling: selectedDays ${selectedDays} clamped to ${clampedDays}`);
  }

  // Calculate end time rounded down to nearest hour
  const calculatedEndTime = endTime || new Date();
  calculatedEndTime.setMinutes(0, 0, 0); // Round down to hour

  // Calculate start time: endTime - (selectedDays × 24 hours)
  const totalHours = clampedDays * 24;
  const calculatedStartTime = new Date(calculatedEndTime.getTime() - (totalHours * 60 * 60 * 1000));

  // MATHEMATICAL FORMULA: hoursPerStep = selectedDays
  const hoursPerStep = clampedDays;
  const dataPoints = 24; // Always exactly 24 steps
  const timeInterval = hoursPerStep * 60 * 60 * 1000; // Milliseconds between steps

  // Determine time format based on hoursPerStep
  let timeFormat: string;
  if (hoursPerStep < 24) {
    // Use hour format for sub-daily intervals
    timeFormat = hoursPerStep === 1 ? 'HH:00' : 'dd HH:00';
  } else {
    // Use date format for daily or multi-daily intervals
    timeFormat = 'MMM dd';
  }

  const stepDescription = hoursPerStep < 24
    ? `${hoursPerStep} hour${hoursPerStep > 1 ? 's' : ''}/step (24 steps)`
    : `${hoursPerStep / 24} day${hoursPerStep > 24 ? 's' : ''}/step (24 steps)`;

  return {
    dataPoints,
    hoursPerStep,
    timeInterval,
    timeFormat,
    stepDescription,
    selectedDays: clampedDays,
    totalHours,
    startTime: calculatedStartTime,
    endTime: calculatedEndTime
  };
};

/**
 * Generate exactly 24 time points using the mathematical formula
 * @param config - Time scale configuration
 * @returns Array of Date objects representing each time step
 */
export const generateTimePoints = (config: TimeScaleConfig): Date[] => {
  const timePoints: Date[] = [];

  // Generate exactly 24 time points: timePoints[i] = startTime + (i × hoursPerStep × 60 × 60 × 1000)
  for (let i = 0; i < config.dataPoints; i++) {
    const timePoint = new Date(config.startTime.getTime() + (i * config.timeInterval));
    timePoints.push(timePoint);
  }

  console.log(`TimeScaling: Generated ${timePoints.length} time points for ${config.selectedDays} days`);
  console.log(`TimeScaling: Range ${config.startTime.toISOString()} to ${config.endTime.toISOString()}`);
  console.log(`TimeScaling: ${config.hoursPerStep} hours per step, ${config.totalHours} total hours`);

  return timePoints;
};

/**
 * Format time label based on the time scale configuration
 * @param date - Date to format
 * @param config - Time scale configuration
 * @returns Formatted time string
 */
export const formatTimeLabel = (date: Date, config: TimeScaleConfig): string => {
  if (config.timeFormat === 'HH:00') {
    // For hourly intervals: "14h"
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      hour12: false
    }) + 'h';
  } else if (config.timeFormat === 'dd HH:00') {
    // For multi-hour intervals within days: "09 14h"
    return date.toLocaleDateString('en-US', {
      day: '2-digit'
    }) + ' ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      hour12: false
    }) + 'h';
  } else if (config.timeFormat === 'MMM dd') {
    // For daily intervals: "Aug 09"
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit'
    });
  }

  return date.toISOString();
};

/**
 * Create time bin boundaries for data aggregation
 * @param config - Time scale configuration
 * @returns Array of time bin objects with start/end times
 */
export const createTimeBins = (config: TimeScaleConfig): Array<{start: Date, end: Date, index: number}> => {
  const bins: Array<{start: Date, end: Date, index: number}> = [];

  for (let i = 0; i < config.dataPoints; i++) {
    const start = new Date(config.startTime.getTime() + (i * config.timeInterval));
    const end = new Date(start.getTime() + config.timeInterval);

    bins.push({ start, end, index: i });
  }

  return bins;
};

/**
 * Data aggregation methods for time bins
 */
export type AggregationMethod = 'average' | 'maximum' | 'minimum' | 'sum' | 'count';

/**
 * Aggregate data points within time bins
 * @param dataPoints - Array of data points with timestamp and value
 * @param config - Time scale configuration
 * @param method - Aggregation method to use
 * @returns Array of aggregated values for each of the 24 bins
 */
export const aggregateDataToBins = <T extends {timestamp: Date | number, value: number}>(
  dataPoints: T[],
  config: TimeScaleConfig,
  method: AggregationMethod = 'average'
): Array<{binIndex: number, value: number, count: number, timeRange: {start: Date, end: Date}}> => {
  const bins = createTimeBins(config);
  const results: Array<{binIndex: number, value: number, count: number, timeRange: {start: Date, end: Date}}> = [];

  bins.forEach((bin, index) => {
    // Find all data points within this time bin
    const binData = dataPoints.filter(point => {
      const timestamp = point.timestamp instanceof Date ? point.timestamp : new Date(point.timestamp);
      return timestamp >= bin.start && timestamp < bin.end;
    });

    let aggregatedValue = 0;
    const count = binData.length;

    if (count > 0) {
      const values = binData.map(point => point.value);

      switch (method) {
        case 'average':
          aggregatedValue = values.reduce((sum, val) => sum + val, 0) / values.length;
          break;
        case 'maximum':
          aggregatedValue = Math.max(...values);
          break;
        case 'minimum':
          aggregatedValue = Math.min(...values);
          break;
        case 'sum':
          aggregatedValue = values.reduce((sum, val) => sum + val, 0);
          break;
        case 'count':
          aggregatedValue = count;
          break;
      }
    }

    results.push({
      binIndex: index,
      value: aggregatedValue,
      count,
      timeRange: { start: bin.start, end: bin.end }
    });
  });

  return results;
};

/**
 * Validate that a time scale configuration is correct
 * @param config - Time scale configuration
 * @returns Boolean indicating if configuration is valid
 */
export const validateTimeScale = (config: TimeScaleConfig): boolean => {
  const expectedTotalHours = config.dataPoints * config.hoursPerStep;
  const actualTotalHours = (config.endTime.getTime() - config.startTime.getTime()) / (60 * 60 * 1000);

  // Allow small tolerance for rounding
  const isValid = Math.abs(actualTotalHours - expectedTotalHours) <= 1;

  if (!isValid) {
    console.error(`TimeScaling validation failed: expected ${expectedTotalHours}h, got ${actualTotalHours}h`);
  }

  return isValid;
};

/**
 * Helper function to create time scale from selected days (main entry point)
 * @param selectedDays - Number of days (1-24)
 * @param endTime - Optional end time
 * @returns Complete time scale configuration
 */
export const createTimeScaleFromDays = (selectedDays: number, endTime?: Date): TimeScaleConfig => {
  // Input validation
  if (typeof selectedDays !== 'number' || isNaN(selectedDays)) {
    console.error(`TimeScaling: Invalid selectedDays ${selectedDays}, defaulting to 1`);
    selectedDays = 1;
  }

  if (selectedDays < 1 || selectedDays > 24) {
    console.warn(`TimeScaling: selectedDays ${selectedDays} out of range [1-24], clamping`);
  }

  if (endTime && !(endTime instanceof Date)) {
    console.error(`TimeScaling: Invalid endTime ${endTime}, using current time`);
    endTime = undefined;
  }

  const config = calculateTimeScale(selectedDays, endTime);

  // Validate configuration
  if (!validateTimeScale(config)) {
    console.error('TimeScaling: Configuration validation failed');
    console.error('Config:', config);
  } else {
    console.log(`TimeScaling: Created valid configuration for ${config.selectedDays} days`);
    console.log(`TimeScaling: ${config.hoursPerStep} hours/step, ${config.totalHours} total hours`);
  }

  return config;
};

/**
 * Generate formatted time labels for all 24 steps
 * @param config - Time scale configuration
 * @returns Array of formatted time labels
 */
export const generateTimeLabels = (config: TimeScaleConfig): string[] => {
  const timePoints = generateTimePoints(config);
  return timePoints.map(point => formatTimeLabel(point, config));
};

/**
 * Create tooltip information for a specific time bin
 * @param binIndex - Index of the time bin (0-23)
 * @param config - Time scale configuration
 * @returns Tooltip information object
 */
export const createTooltipInfo = (binIndex: number, config: TimeScaleConfig) => {
  // Validate inputs
  if (typeof binIndex !== 'number' || binIndex < 0 || binIndex >= 24) {
    console.error(`TimeScaling: Invalid binIndex ${binIndex}, must be 0-23`);
    return null;
  }

  if (!config || typeof config !== 'object') {
    console.error('TimeScaling: Invalid config object for tooltip');
    return null;
  }

  const bins = createTimeBins(config);
  const bin = bins[binIndex];

  if (!bin) {
    console.error(`TimeScaling: No bin found for index ${binIndex}`);
    return null;
  }

  const startLabel = formatTimeLabel(bin.start, config);
  const endLabel = formatTimeLabel(bin.end, config);

  return {
    timeRange: `${startLabel} - ${endLabel}`,
    duration: `${config.hoursPerStep} hour${config.hoursPerStep > 1 ? 's' : ''}`,
    binIndex,
    startTime: bin.start,
    endTime: bin.end
  };
};

/**
 * Test the time scaling system with various inputs
 * @param testCases - Array of test cases to validate
 * @returns Test results
 */
export const testTimeScalingSystem = (testCases: number[] = [1, 2, 3, 4, 5, 6, 12, 24]) => {
  console.log('TimeScaling: Running system tests...');

  const results = testCases.map(days => {
    try {
      const config = createTimeScaleFromDays(days);
      const timePoints = generateTimePoints(config);
      const labels = generateTimeLabels(config);

      const isValid = timePoints.length === 24 && labels.length === 24;

      return {
        days,
        hoursPerStep: config.hoursPerStep,
        totalHours: config.totalHours,
        dataPoints: timePoints.length,
        valid: isValid,
        stepDescription: config.stepDescription
      };
    } catch (error) {
      console.error(`TimeScaling: Test failed for ${days} days:`, error);
      return {
        days,
        valid: false,
        error: error.message
      };
    }
  });

  console.table(results);

  const allValid = results.every(r => r.valid);
  console.log(`TimeScaling: All tests ${allValid ? 'PASSED' : 'FAILED'}`);

  return results;
};
