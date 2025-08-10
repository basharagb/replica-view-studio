import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { computeBins, aggregateDataIntoBins, getDaySeparatorPositions } from '../utils/chartBinning';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import TemperatureHistoryChart from './TemperatureHistoryChart';

interface TestDataPoint {
  timestamp: Date;
  temperature: number;
}

interface BinningTestChartProps {
  className?: string;
}

const BinningTestChart: React.FC<BinningTestChartProps> = ({ className = '' }) => {
  const [selectedDays, setSelectedDays] = useState(1);
  const [useRealData, setUseRealData] = useState(true); // API-FIRST: Default to real API data
  const [selectedSilo, setSelectedSilo] = useState(1);

  // Generate sample data for testing
  const sampleData = useMemo(() => {
    const data: TestDataPoint[] = [];
    const now = new Date();
    now.setMinutes(0, 0, 0); // Round to hour
    
    // Generate data points every 30 minutes for the selected period
    const totalHours = selectedDays * 24;
    const intervalMinutes = 30;
    const totalPoints = (totalHours * 60) / intervalMinutes;
    
    for (let i = 0; i < totalPoints; i++) {
      const timestamp = new Date(now.getTime() - (totalHours * 60 * 60 * 1000) + (i * intervalMinutes * 60 * 1000));
      const temperature = 25 + Math.sin(i * 0.1) * 10 + Math.random() * 5; // Simulated temperature data
      data.push({ timestamp, temperature });
    }
    
    return data;
  }, [selectedDays]);

  // Create binned data using the new system
  const binnedData = useMemo(() => {
    const endTime = new Date();
    endTime.setMinutes(0, 0, 0);
    
    const bins = computeBins(selectedDays, endTime);
    const aggregatedData = aggregateDataIntoBins(
      sampleData,
      bins,
      (item) => item.temperature,
      'avg'
    );

    return aggregatedData.map((binData, index) => ({
      binIndex: index,
      temperature: binData.value,
      count: binData.count,
      label: bins[index].label,
      timeRange: `${bins[index].start.toLocaleString()} - ${bins[index].end.toLocaleString()}`
    }));
  }, [sampleData, selectedDays]);

  // Get day separators for visual indicators
  const daySeparators = useMemo(() => {
    const endTime = new Date();
    endTime.setMinutes(0, 0, 0);
    const bins = computeBins(selectedDays, endTime);
    return getDaySeparatorPositions(bins, selectedDays);
  }, [selectedDays]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const binData = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">
            Binning Test Chart
          </p>
          <p className="text-sm text-gray-600">
            {binData.timeRange}
          </p>
          <p className="text-lg font-bold" style={{ color: payload[0].color }}>
            {payload[0].value.toFixed(1)}°C (avg)
          </p>
          <p className="text-xs text-gray-500">
            {binData.count} data points in bin
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Standardized Binning System Test</CardTitle>

        {/* Day Selection */}
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 7, 14, 24].map(days => (
            <Button
              key={days}
              variant={selectedDays === days ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDays(days)}
            >
              {days} day{days > 1 ? 's' : ''}
            </Button>
          ))}
        </div>

        {/* Data Source Toggle */}
        <div className="flex gap-2 items-center">
          <Button
            variant={!useRealData ? "default" : "outline"}
            size="sm"
            onClick={() => setUseRealData(false)}
          >
            Mock Data
          </Button>
          <Button
            variant={useRealData ? "default" : "outline"}
            size="sm"
            onClick={() => setUseRealData(true)}
          >
            Real API Data
          </Button>
        </div>

        {/* Silo Selection (for real data) */}
        {useRealData && (
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-600">Silo:</span>
            {[1, 2, 3, 4, 5].map(silo => (
              <Button
                key={silo}
                variant={selectedSilo === silo ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSilo(silo)}
              >
                {silo}
              </Button>
            ))}
          </div>
        )}
        <div className="text-sm text-gray-600">
          <p>Selected: {selectedDays} day{selectedDays > 1 ? 's' : ''} → 24 bins × {selectedDays < 24 ? selectedDays : 24} hour{selectedDays > 1 ? 's' : ''} each</p>
          <p>Sample data: {sampleData.length} points → Binned to: {binnedData.length} points</p>
        </div>
      </CardHeader>
      <CardContent>
        {useRealData ? (
          // Use the real TemperatureHistoryChart component with API integration
          <TemperatureHistoryChart
            siloNumber={selectedSilo}
            selectedDays={selectedDays}
            useRealData={true}
            height={400}
            className="mb-4"
          />
        ) : (
          // Use mock data visualization
          <div style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={binnedData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
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
                domain={['dataMin - 5', 'dataMax + 5']}
                stroke="#6b7280"
                fontSize={12}
                label={{ 
                  value: 'Temperature (°C)', 
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
              
              <Line 
                type="monotone" 
                dataKey="temperature" 
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
          </div>
        )}

        {/* Statistics */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-lg font-bold text-blue-600">
              {binnedData.length}
            </div>
            <div className="text-xs text-gray-500">Total Bins</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-lg font-bold text-green-600">
              {binnedData.filter(d => d.count > 0).length}
            </div>
            <div className="text-xs text-gray-500">Bins with Data</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-lg font-bold text-gray-800">
              {binnedData.reduce((sum, d) => sum + d.count, 0)}
            </div>
            <div className="text-xs text-gray-500">Total Data Points</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BinningTestChart;
