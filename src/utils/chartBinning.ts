/**
 * Standardized Dynamic X-axis Binning System for Time-Series Charts
 * 
 * Creates exactly 24 data points regardless of the selected date range.
 * This system ensures consistent chart visualization across all time-series components.
 */

import { format } from 'date-fns';

export interface TimeBin {
  start: Date;
  end: Date;
  label: string;
  index: number;
}

export interface BinnedDataPoint {
  binIndex: number;
  value: number;
  count: number;
  timeRange: {
    start: Date;
    end: Date;
  };
  label: string;
}

export type AggregationType = 'avg' | 'max' | 'min' | 'sum' | 'count';

/**
 * Compute 24 time bins for the given date range
 * @param selectedDays - Integer range [1-24] representing the number of days to display
 * @param endTime - Current timestamp rounded down to the nearest hour
 * @returns Array of 24 TimeBin objects
 */
export function computeBins(selectedDays: number, endTime?: Date): TimeBin[] {
  // Clamp selectedDays to valid range [1-24]
  const clampedDays = Math.max(1, Math.min(24, Math.floor(selectedDays)));
  
  if (clampedDays !== selectedDays) {
    console.warn(`ChartBinning: selectedDays ${selectedDays} clamped to ${clampedDays}`);
  }

  // Calculate endTime rounded down to nearest hour
  const calculatedEndTime = endTime || new Date();
  calculatedEndTime.setMinutes(0, 0, 0);

  // Calculate startTime: endTime - (selectedDays * 24 * 60 * 60 * 1000)
  const startTime = new Date(calculatedEndTime.getTime() - (clampedDays * 24 * 60 * 60 * 1000));

  // Binning Logic: Always produces exactly 24 bins
  const binCount = 24;
  const binSizeHours = clampedDays < 24 ? clampedDays : 24;
  const binSizeMs = binSizeHours * 60 * 60 * 1000;

  const bins: TimeBin[] = [];

  // Generate 24 bins covering the entire time range
  for (let i = 0; i < binCount; i++) {
    const binStart = new Date(startTime.getTime() + (i * binSizeMs));
    const binEnd = new Date(binStart.getTime() + binSizeMs);
    
    const label = formatBinLabel(binStart, binEnd, clampedDays);
    
    bins.push({
      start: binStart,
      end: binEnd,
      label,
      index: i
    });
  }

  return bins;
}

/**
 * Aggregate data points into bins using the specified aggregation method
 * @param data - Array of data points with timestamp and value
 * @param bins - Array of TimeBin objects
 * @param valueExtractor - Function to extract numeric value from data item
 * @param aggregationType - Type of aggregation to perform
 * @returns Array of aggregated values for each bin
 */
export function aggregateDataIntoBins<T>(
  data: T[],
  bins: TimeBin[],
  valueExtractor: (item: T) => number,
  aggregationType: AggregationType = 'avg'
): BinnedDataPoint[] {
  return bins.map((bin, index) => {
    // Find all data points within this time bin [binStart, binEnd)
    const binData = data.filter(item => {
      const timestamp = getTimestamp(item);
      return timestamp >= bin.start && timestamp < bin.end;
    });

    let aggregatedValue = 0;
    const count = binData.length;

    if (count > 0) {
      const values = binData.map(valueExtractor);

      switch (aggregationType) {
        case 'avg':
          aggregatedValue = values.reduce((sum, val) => sum + val, 0) / values.length;
          break;
        case 'max':
          aggregatedValue = Math.max(...values);
          break;
        case 'min':
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

    return {
      binIndex: index,
      value: aggregatedValue,
      count,
      timeRange: {
        start: bin.start,
        end: bin.end
      },
      label: bin.label
    };
  });
}

/**
 * Format X-axis labels based on the selected days range
 * @param bins - Array of TimeBin objects
 * @param selectedDays - Number of days selected
 * @returns Array of formatted label strings
 */
export function formatXAxisLabels(bins: TimeBin[], selectedDays: number): string[] {
  return bins.map(bin => {
    if (selectedDays === 24) {
      // For 24-day range: show dates (DD MMM format)
      return format(bin.start, 'dd MMM');
    } else {
      // For ranges < 24 days: show hours (HH:00 format)
      return format(bin.start, 'HH:00');
    }
  });
}

/**
 * Create tooltip information for a time bin
 * @param bin - TimeBin object
 * @param value - Aggregated value for the bin
 * @param count - Number of data points in the bin
 * @param aggregationType - Type of aggregation used
 * @returns Formatted tooltip string
 */
export function createTooltipContent(
  bin: TimeBin,
  value: number,
  count: number,
  aggregationType: AggregationType
): string {
  const startStr = format(bin.start, 'MMM d, HH:mm');
  const endStr = format(bin.end, 'MMM d, HH:mm');
  const aggregationLabel = getAggregationLabel(aggregationType);
  
  return `${startStr} - ${endStr}\n${aggregationLabel}: ${value.toFixed(2)}\nData points: ${count}`;
}

/**
 * Get day separator positions for charts with ranges < 24 days
 * @param bins - Array of TimeBin objects
 * @param selectedDays - Number of days selected
 * @returns Array of bin indices where day boundaries occur
 */
export function getDaySeparatorPositions(bins: TimeBin[], selectedDays: number): number[] {
  if (selectedDays >= 24) return [];

  const separators: number[] = [];
  let currentDay = bins[0]?.start.getDate();

  bins.forEach((bin, index) => {
    const binDay = bin.start.getDate();
    if (binDay !== currentDay && index > 0) {
      separators.push(index);
      currentDay = binDay;
    }
  });

  return separators;
}

// Helper functions

/**
 * Extract timestamp from data item (handles various timestamp formats)
 */
function getTimestamp(item: any): Date {
  if (item.timestamp instanceof Date) return item.timestamp;
  if (item.time instanceof Date) return item.time;
  if (typeof item.timestamp === 'string' || typeof item.timestamp === 'number') {
    return new Date(item.timestamp);
  }
  if (typeof item.time === 'string' || typeof item.time === 'number') {
    return new Date(item.time);
  }
  
  console.warn('ChartBinning: Could not extract timestamp from item:', item);
  return new Date();
}

/**
 * Format bin label based on the time range
 */
function formatBinLabel(start: Date, end: Date, selectedDays: number): string {
  if (selectedDays === 24) {
    return format(start, 'dd MMM');
  } else if (selectedDays === 1) {
    return format(start, 'HH:00');
  } else {
    return format(start, 'dd HH:00');
  }
}

/**
 * Get human-readable aggregation label
 */
function getAggregationLabel(type: AggregationType): string {
  switch (type) {
    case 'avg': return 'Average';
    case 'max': return 'Maximum';
    case 'min': return 'Minimum';
    case 'sum': return 'Sum';
    case 'count': return 'Count';
    default: return 'Value';
  }
}

/**
 * Validate binning parameters
 */
export function validateBinningParams(selectedDays: number, endTime?: Date): boolean {
  if (typeof selectedDays !== 'number' || isNaN(selectedDays)) {
    console.error('ChartBinning: selectedDays must be a valid number');
    return false;
  }

  if (selectedDays < 1 || selectedDays > 24) {
    console.warn('ChartBinning: selectedDays should be in range [1-24]');
  }

  if (endTime && !(endTime instanceof Date)) {
    console.error('ChartBinning: endTime must be a valid Date object');
    return false;
  }

  return true;
}
