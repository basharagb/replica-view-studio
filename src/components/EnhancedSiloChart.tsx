/**
 * Enhanced Silo Chart Component
 * Fully integrated with API service and standardized binning system
 */

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { RefreshCw, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { useSiloReadings } from '../hooks/useSiloData';
import { getDaySeparatorPositions } from '../utils/chartBinning';
import { ProcessedSiloData, BinnedSiloData } from '../types/api';

interface EnhancedSiloChartProps {
  siloNumbers: number[];
  selectedDays?: number;
  endTime?: Date;
  autoRefresh?: boolean;
  height?: number;
  className?: string;
  showControls?: boolean;
  dataType?: 'temperature' | 'level' | 'humidity' | 'pressure' | 'flow_rate' | 'vibration' | 'power_consumption';
}

const EnhancedSiloChart: React.FC<EnhancedSiloChartProps> = ({
  siloNumbers,
  selectedDays: initialSelectedDays = 1,
  endTime,
  autoRefresh = false,
  height = 400,
  className = '',
  showControls = true,
  dataType = 'temperature'
}) => {
  const [selectedDays, setSelectedDays] = useState(initialSelectedDays);
  const [currentDataType, setCurrentDataType] = useState(dataType);

  // Use the custom hook for data fetching
  const { data, loading, error, refetch, clearError } = useSiloReadings(
    siloNumbers,
    selectedDays,
    endTime,
    autoRefresh
  );

  // Process data for chart display
  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    // Combine all silo data into a single chart dataset
    const combinedData: Array<{
      binIndex: number;
      label: string;
      timeRange: string;
      [key: string]: any; // Dynamic silo data
    }> = [];

    // Get the first silo's binned data to establish the time structure
    const firstSilo = data[0] as ProcessedSiloData;
    if (!firstSilo || !firstSilo.binnedData) return [];

    firstSilo.binnedData.forEach((bin, index) => {
      const dataPoint: any = {
        binIndex: index,
        label: bin.label,
        timeRange: `${bin.timeRange.start.toLocaleString()} - ${bin.timeRange.end.toLocaleString()}`
      };

      // Add data for each silo
      data.forEach(siloData => {
        const silo = siloData as ProcessedSiloData;
        const binData = silo.binnedData[index];
        if (binData) {
          const value = (binData as any)[currentDataType];
          if (value !== undefined && value !== null) {
            dataPoint[`silo_${silo.silo_number}`] = value;
          }
        }
      });

      combinedData.push(dataPoint);
    });

    return combinedData;
  }, [data, currentDataType]);

  // Get day separators for visual indicators
  const daySeparators = React.useMemo(() => {
    if (!chartData.length) return [];
    // Mock bins for separator calculation
    const mockBins = chartData.map((_, index) => ({
      start: new Date(),
      end: new Date(),
      label: '',
      index
    }));
    return getDaySeparatorPositions(mockBins, selectedDays);
  }, [chartData.length, selectedDays]);

  // Get color for each silo line
  const getSiloColor = (siloNumber: number): string => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
    return colors[(siloNumber - 1) % colors.length];
  };

  // Get unit for current data type
  const getUnit = (type: string): string => {
    switch (type) {
      case 'temperature': return '°C';
      case 'level': return '%';
      case 'humidity': return '%';
      case 'pressure': return 'Pa';
      case 'flow_rate': return 'L/min';
      case 'vibration': return 'Hz';
      case 'power_consumption': return 'W';
      default: return '';
    }
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800 mb-2">
            {currentDataType.charAt(0).toUpperCase() + currentDataType.slice(1)} Data
          </p>
          <p className="text-sm text-gray-600 mb-2">
            {data.timeRange}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(2)}{getUnit(currentDataType)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Silo {siloNumbers.join(', ')} - {currentDataType.charAt(0).toUpperCase() + currentDataType.slice(1)}
          </CardTitle>
          <div className="flex items-center gap-2">
            {autoRefresh && (
              <div className="flex items-center text-green-600 text-sm">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse mr-1"></div>
                Live
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={loading.isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${loading.isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {showControls && (
          <div className="space-y-3">
            {/* Day Selection */}
            <div className="flex gap-2 flex-wrap">
              <span className="text-sm text-gray-600 self-center">Days:</span>
              {[1, 2, 3, 7, 14, 24].map(days => (
                <Button
                  key={days}
                  variant={selectedDays === days ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDays(days)}
                >
                  {days}
                </Button>
              ))}
            </div>

            {/* Data Type Selection */}
            <div className="flex gap-2 flex-wrap">
              <span className="text-sm text-gray-600 self-center">Data:</span>
              {['temperature', 'level', 'humidity', 'pressure'].map(type => (
                <Button
                  key={type}
                  variant={currentDataType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentDataType(type as any)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Status Information */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Last {selectedDays} day{selectedDays > 1 ? 's' : ''} (24 bins)</span>
          <span className="text-green-600 font-medium">• API Data</span>
          {data.length > 0 && (
            <span>
              {(data as ProcessedSiloData[]).reduce((sum, silo) => sum + silo.rawDataCount, 0)} raw data points
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Loading State */}
        {loading.isLoading && (
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">{loading.message || 'Loading...'}</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error.hasError && !loading.isLoading && (
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">Failed to load data</p>
              <p className="text-xs text-gray-500 mb-3">{error.error?.message}</p>
              {error.canRetry && (
                <Button size="sm" onClick={refetch}>
                  Retry
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Chart */}
        {!loading.isLoading && !error.hasError && chartData.length > 0 && (
          <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="label"
                  stroke="#6b7280"
                  fontSize={12}
                  interval={0}
                  angle={selectedDays > 7 ? -45 : 0}
                  textAnchor={selectedDays > 7 ? 'end' : 'middle'}
                  height={selectedDays > 7 ? 60 : 30}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  label={{ 
                    value: `${currentDataType.charAt(0).toUpperCase() + currentDataType.slice(1)} (${getUnit(currentDataType)})`, 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Day separator lines for ranges < 24 days */}
                {selectedDays < 24 && daySeparators.map(separatorIndex => (
                  <ReferenceLine 
                    key={separatorIndex}
                    x={separatorIndex}
                    stroke="#e5e7eb"
                    strokeDasharray="2 2"
                    strokeWidth={1}
                  />
                ))}
                
                {/* Lines for each silo */}
                {siloNumbers.map(siloNumber => (
                  <Line 
                    key={siloNumber}
                    type="monotone" 
                    dataKey={`silo_${siloNumber}`}
                    stroke={getSiloColor(siloNumber)}
                    strokeWidth={2}
                    dot={{ fill: getSiloColor(siloNumber), strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: getSiloColor(siloNumber), strokeWidth: 2 }}
                    connectNulls={false}
                    name={`Silo ${siloNumber}`}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* No Data State */}
        {!loading.isLoading && !error.hasError && chartData.length === 0 && (
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-center">
              <TrendingDown className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No data available for the selected time range</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedSiloChart;
