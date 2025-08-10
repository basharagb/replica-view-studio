/**
 * Silo Readings Service
 * Integrates API endpoints with the standardized binning system
 */

import { apiClient } from './apiClient';
import { 
  computeBins, 
  aggregateDataIntoBins, 
  AggregationType as BinningAggregationType 
} from '../utils/chartBinning';
import {
  APIEndpoints,
  SiloNumberRequestParams,
  GroupIdRequestParams,
  SiloBinnedRequestParams,
  GroupBinnedRequestParams,
  LevelReading,
  SiloReading,
  GroupReading,
  BinnedSiloData,
  BinnedGroupData,
  ProcessedSiloData,
  ProcessedGroupData,
  AggregationType,
  AggregationConfig,
  APIResponse,
  APIError
} from '../types/api';

export class SiloReadingsService {
  
  /**
   * Calculate time range from selectedDays parameter
   */
  private calculateTimeRange(selectedDays: number, endTime?: Date): { start: string; end: string } {
    // Clamp selectedDays to [1-24] range
    const clampedDays = Math.max(1, Math.min(24, Math.floor(selectedDays)));
    
    if (clampedDays !== selectedDays) {
      console.warn(`SiloReadingsService: selectedDays ${selectedDays} clamped to ${clampedDays}`);
    }

    // Calculate endTime rounded down to nearest hour
    const calculatedEndTime = endTime || new Date();
    calculatedEndTime.setMinutes(0, 0, 0);

    // Calculate startTime: endTime - (selectedDays * 24 * 60 * 60 * 1000)
    const startTime = new Date(calculatedEndTime.getTime() - (clampedDays * 24 * 60 * 60 * 1000));

    return {
      start: startTime.toISOString().slice(0, 16), // Format: "2025-07-16T00:00"
      end: calculatedEndTime.toISOString().slice(0, 16)
    };
  }

  /**
   * Convert API data to binned format
   */
  private processSiloDataToBins<T extends { timestamp: string; silo_number: number }>(
    data: T[],
    selectedDays: number,
    endTime: Date,
    aggregationConfig: AggregationConfig
  ): BinnedSiloData[] {
    if (!data || data.length === 0) return [];

    // Group data by silo number
    const siloGroups = data.reduce((groups, item) => {
      if (!groups[item.silo_number]) {
        groups[item.silo_number] = [];
      }
      groups[item.silo_number].push(item);
      return groups;
    }, {} as Record<number, T[]>);

    const allBinnedData: BinnedSiloData[] = [];

    // Process each silo separately
    Object.entries(siloGroups).forEach(([siloNumber, siloData]) => {
      const bins = computeBins(selectedDays, endTime);
      
      // Create binned data for each metric
      const metrics = ['level', 'temperature', 'humidity', 'pressure', 'flow_rate', 'vibration', 'power_consumption'] as const;
      
      metrics.forEach(metric => {
        if (aggregationConfig[metric] && siloData.some(item => (item as any)[metric] !== undefined)) {
          const aggregationType = this.mapAggregationType(aggregationConfig[metric]!);
          
          const aggregatedData = aggregateDataIntoBins(
            siloData,
            bins,
            (item) => (item as any)[metric] || 0,
            aggregationType
          );

          aggregatedData.forEach((binData, index) => {
            const existingBin = allBinnedData.find(
              b => b.silo_number === parseInt(siloNumber) && b.binIndex === index
            );

            if (existingBin) {
              (existingBin as any)[metric] = binData.value;
            } else {
              const newBin: BinnedSiloData = {
                silo_number: parseInt(siloNumber),
                binIndex: index,
                timestamp: bins[index].start,
                count: binData.count,
                timeRange: binData.timeRange,
                label: binData.label
              };
              (newBin as any)[metric] = binData.value;
              allBinnedData.push(newBin);
            }
          });
        }
      });
    });

    return allBinnedData.sort((a, b) => a.silo_number - b.silo_number || a.binIndex - b.binIndex);
  }

  /**
   * Map API aggregation type to binning aggregation type
   */
  private mapAggregationType(apiType: AggregationType): BinningAggregationType {
    switch (apiType) {
      case 'latest': return 'max'; // Use max as proxy for latest
      default: return apiType as BinningAggregationType;
    }
  }

  // ========== LEVEL ENDPOINTS ==========

  /**
   * Get level readings by silo numbers with binning
   */
  async getLevelsBySiloNumbers(params: SiloBinnedRequestParams): Promise<ProcessedSiloData[]> {
    const timeRange = this.calculateTimeRange(params.selectedDays, params.endTime);
    
    const apiParams: SiloNumberRequestParams = {
      silo_number: params.silo_number,
      start: timeRange.start,
      end: timeRange.end
    };

    try {
      const response = await apiClient.getSiloData<LevelReading[]>(
        APIEndpoints.LEVELS_BY_SILO,
        apiParams
      );

      const binnedData = this.processSiloDataToBins(
        response.data,
        params.selectedDays,
        params.endTime || new Date(),
        { level: 'avg' }
      );

      // Group by silo number
      const siloGroups = binnedData.reduce((groups, item) => {
        if (!groups[item.silo_number]) {
          groups[item.silo_number] = [];
        }
        groups[item.silo_number].push(item);
        return groups;
      }, {} as Record<number, BinnedSiloData[]>);

      return Object.entries(siloGroups).map(([siloNumber, data]) => ({
        silo_number: parseInt(siloNumber),
        binnedData: data,
        rawDataCount: response.data.filter(d => d.silo_number === parseInt(siloNumber)).length,
        timeRange: {
          start: new Date(timeRange.start),
          end: new Date(timeRange.end)
        },
        selectedDays: params.selectedDays
      }));

    } catch (error) {
      console.error('Error fetching levels by silo numbers:', error);
      throw error;
    }
  }

  /**
   * Get maximum level readings by silo numbers with binning
   */
  async getMaxLevelsBySiloNumbers(params: SiloBinnedRequestParams): Promise<ProcessedSiloData[]> {
    const timeRange = this.calculateTimeRange(params.selectedDays, params.endTime);
    
    const apiParams: SiloNumberRequestParams = {
      silo_number: params.silo_number,
      start: timeRange.start,
      end: timeRange.end
    };

    try {
      const response = await apiClient.getSiloData<LevelReading[]>(
        APIEndpoints.LEVELS_MAX_BY_SILO,
        apiParams
      );

      const binnedData = this.processSiloDataToBins(
        response.data,
        params.selectedDays,
        params.endTime || new Date(),
        { level: 'max' }
      );

      // Group by silo number
      const siloGroups = binnedData.reduce((groups, item) => {
        if (!groups[item.silo_number]) {
          groups[item.silo_number] = [];
        }
        groups[item.silo_number].push(item);
        return groups;
      }, {} as Record<number, BinnedSiloData[]>);

      return Object.entries(siloGroups).map(([siloNumber, data]) => ({
        silo_number: parseInt(siloNumber),
        binnedData: data,
        rawDataCount: response.data.filter(d => d.silo_number === parseInt(siloNumber)).length,
        timeRange: {
          start: new Date(timeRange.start),
          end: new Date(timeRange.end)
        },
        selectedDays: params.selectedDays
      }));

    } catch (error) {
      console.error('Error fetching max levels by silo numbers:', error);
      throw error;
    }
  }

  /**
   * Get latest level readings by silo numbers with binning
   */
  async getLatestLevelsBySiloNumbers(params: SiloBinnedRequestParams): Promise<ProcessedSiloData[]> {
    const timeRange = this.calculateTimeRange(params.selectedDays, params.endTime);
    
    const apiParams: SiloNumberRequestParams = {
      silo_number: params.silo_number,
      start: timeRange.start,
      end: timeRange.end
    };

    try {
      const response = await apiClient.getSiloData<LevelReading[]>(
        APIEndpoints.LEVELS_LATEST_BY_SILO,
        apiParams
      );

      const binnedData = this.processSiloDataToBins(
        response.data,
        params.selectedDays,
        params.endTime || new Date(),
        { level: 'latest' }
      );

      // Group by silo number
      const siloGroups = binnedData.reduce((groups, item) => {
        if (!groups[item.silo_number]) {
          groups[item.silo_number] = [];
        }
        groups[item.silo_number].push(item);
        return groups;
      }, {} as Record<number, BinnedSiloData[]>);

      return Object.entries(siloGroups).map(([siloNumber, data]) => ({
        silo_number: parseInt(siloNumber),
        binnedData: data,
        rawDataCount: response.data.filter(d => d.silo_number === parseInt(siloNumber)).length,
        timeRange: {
          start: new Date(timeRange.start),
          end: new Date(timeRange.end)
        },
        selectedDays: params.selectedDays
      }));

    } catch (error) {
      console.error('Error fetching latest levels by silo numbers:', error);
      throw error;
    }
  }

  /**
   * Get level readings by group IDs with binning
   */
  async getLevelsByGroupIds(params: GroupBinnedRequestParams): Promise<ProcessedGroupData[]> {
    const timeRange = this.calculateTimeRange(params.selectedDays, params.endTime);
    
    const apiParams: GroupIdRequestParams = {
      group_id: params.group_id,
      start: timeRange.start,
      end: timeRange.end
    };

    try {
      const response = await apiClient.getGroupData<GroupReading[]>(
        APIEndpoints.LEVELS_BY_GROUP,
        apiParams
      );

      // Process group data (implementation continues in next part)
      // This is a complex operation that needs more space
      return this.processGroupDataToBins(response.data, params);

    } catch (error) {
      console.error('Error fetching levels by group IDs:', error);
      throw error;
    }
  }

  /**
   * Process group data into binned format
   */
  private processGroupDataToBins(data: GroupReading[], params: GroupBinnedRequestParams): ProcessedGroupData[] {
    if (!data || data.length === 0) return [];

    // Group data by group_id
    const groupGroups = data.reduce((groups, item) => {
      if (!groups[item.group_id]) {
        groups[item.group_id] = [];
      }
      groups[item.group_id].push(item);
      return groups;
    }, {} as Record<number, GroupReading[]>);

    return Object.entries(groupGroups).map(([groupId, groupData]) => {
      // Further group by silo_number within each group
      const siloGroups = groupData.reduce((silos, item) => {
        if (!silos[item.silo_number]) {
          silos[item.silo_number] = [];
        }
        silos[item.silo_number].push(item);
        return silos;
      }, {} as Record<number, GroupReading[]>);

      const siloProcessedData: ProcessedSiloData[] = Object.entries(siloGroups).map(([siloNumber, siloData]) => {
        const binnedData = this.processSiloDataToBins(
          siloData,
          params.selectedDays,
          params.endTime || new Date(),
          { level: 'avg', temperature: 'avg', humidity: 'avg', pressure: 'avg' }
        );

        return {
          silo_number: parseInt(siloNumber),
          binnedData,
          rawDataCount: siloData.length,
          timeRange: {
            start: new Date(this.calculateTimeRange(params.selectedDays, params.endTime).start),
            end: new Date(this.calculateTimeRange(params.selectedDays, params.endTime).end)
          },
          selectedDays: params.selectedDays
        };
      });

      // Create combined binned data for the entire group
      const combinedBinnedData: BinnedGroupData[] = [];
      siloProcessedData.forEach(siloData => {
        siloData.binnedData.forEach(binData => {
          combinedBinnedData.push({
            group_id: parseInt(groupId),
            silo_number: binData.silo_number,
            binIndex: binData.binIndex,
            timestamp: binData.timestamp,
            level: binData.level,
            temperature: binData.temperature,
            humidity: binData.humidity,
            pressure: binData.pressure,
            flow_rate: binData.flow_rate,
            vibration: binData.vibration,
            power_consumption: binData.power_consumption,
            count: binData.count,
            timeRange: binData.timeRange,
            label: binData.label
          });
        });
      });

      return {
        group_id: parseInt(groupId),
        silos: siloProcessedData,
        combinedBinnedData,
        totalRawDataCount: groupData.length,
        timeRange: {
          start: new Date(this.calculateTimeRange(params.selectedDays, params.endTime).start),
          end: new Date(this.calculateTimeRange(params.selectedDays, params.endTime).end)
        },
        selectedDays: params.selectedDays
      };
    });
  }

  /**
   * Get maximum level readings by group IDs with binning
   */
  async getMaxLevelsByGroupIds(params: GroupBinnedRequestParams): Promise<ProcessedGroupData[]> {
    const timeRange = this.calculateTimeRange(params.selectedDays, params.endTime);

    const apiParams: GroupIdRequestParams = {
      group_id: params.group_id,
      start: timeRange.start,
      end: timeRange.end
    };

    try {
      const response = await apiClient.getGroupData<GroupReading[]>(
        APIEndpoints.LEVELS_MAX_BY_GROUP,
        apiParams
      );

      return this.processGroupDataToBins(response.data, params);

    } catch (error) {
      console.error('Error fetching max levels by group IDs:', error);
      throw error;
    }
  }

  /**
   * Get latest level readings by group IDs with binning
   */
  async getLatestLevelsByGroupIds(params: GroupBinnedRequestParams): Promise<ProcessedGroupData[]> {
    const timeRange = this.calculateTimeRange(params.selectedDays, params.endTime);

    const apiParams: GroupIdRequestParams = {
      group_id: params.group_id,
      start: timeRange.start,
      end: timeRange.end
    };

    try {
      const response = await apiClient.getGroupData<GroupReading[]>(
        APIEndpoints.LEVELS_LATEST_BY_GROUP,
        apiParams
      );

      return this.processGroupDataToBins(response.data, params);

    } catch (error) {
      console.error('Error fetching latest levels by group IDs:', error);
      throw error;
    }
  }

  // ========== ALL READINGS ENDPOINTS ==========

  /**
   * Get all readings by silo numbers with binning
   */
  async getReadingsBySiloNumbers(params: SiloBinnedRequestParams): Promise<ProcessedSiloData[]> {
    const timeRange = this.calculateTimeRange(params.selectedDays, params.endTime);

    const apiParams: SiloNumberRequestParams = {
      silo_number: params.silo_number,
      start: timeRange.start,
      end: timeRange.end
    };

    try {
      const response = await apiClient.getSiloData<SiloReading[]>(
        APIEndpoints.READINGS_BY_SILO,
        apiParams
      );

      const binnedData = this.processSiloDataToBins(
        response.data,
        params.selectedDays,
        params.endTime || new Date(),
        {
          level: 'avg',
          temperature: 'avg',
          humidity: 'avg',
          pressure: 'avg',
          flow_rate: 'avg',
          vibration: 'avg',
          power_consumption: 'avg'
        }
      );

      // Group by silo number
      const siloGroups = binnedData.reduce((groups, item) => {
        if (!groups[item.silo_number]) {
          groups[item.silo_number] = [];
        }
        groups[item.silo_number].push(item);
        return groups;
      }, {} as Record<number, BinnedSiloData[]>);

      return Object.entries(siloGroups).map(([siloNumber, data]) => ({
        silo_number: parseInt(siloNumber),
        binnedData: data,
        rawDataCount: response.data.filter(d => d.silo_number === parseInt(siloNumber)).length,
        timeRange: {
          start: new Date(timeRange.start),
          end: new Date(timeRange.end)
        },
        selectedDays: params.selectedDays
      }));

    } catch (error) {
      console.error('Error fetching readings by silo numbers:', error);
      throw error;
    }
  }

  /**
   * Get all readings by group IDs with binning
   */
  async getReadingsByGroupIds(params: GroupBinnedRequestParams): Promise<ProcessedGroupData[]> {
    const timeRange = this.calculateTimeRange(params.selectedDays, params.endTime);

    const apiParams: GroupIdRequestParams = {
      group_id: params.group_id,
      start: timeRange.start,
      end: timeRange.end
    };

    try {
      const response = await apiClient.getGroupData<GroupReading[]>(
        APIEndpoints.READINGS_BY_GROUP,
        apiParams
      );

      return this.processGroupDataToBins(response.data, params);

    } catch (error) {
      console.error('Error fetching readings by group IDs:', error);
      throw error;
    }
  }
}
}

// Export singleton instance
export const siloReadingsService = new SiloReadingsService();
