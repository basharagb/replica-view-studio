import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TEMPERATURE_THRESHOLDS } from '../services/siloData';

interface TemperatureDataPoint {
  timestamp: string;
  temperature: number;
  time: Date;
}

interface TemperatureHistoryChartProps {
  siloNumber: number;
  data: TemperatureDataPoint[];
  className?: string;
  height?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    color: string;
    value: number;
    payload: TemperatureDataPoint;
  }>;
  label?: string;
}

const TemperatureHistoryChart: React.FC<TemperatureHistoryChartProps> = ({
  siloNumber,
  data,
  className = '',
  height = 300
}) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">
            Silo {siloNumber}
          </p>
          <p className="text-sm text-gray-600">
            {new Date(label).toLocaleString()}
          </p>
          <p className="text-lg font-bold" style={{ color: payload[0].color }}>
            {payload[0].value.toFixed(1)}°C
          </p>
        </div>
      );
    }
    return null;
  };

  const getLineColor = () => {
    const latestTemp = data[data.length - 1]?.temperature || 0;
    if (latestTemp > TEMPERATURE_THRESHOLDS.CRITICAL_MIN) return '#dc2626'; // red
    if (latestTemp >= TEMPERATURE_THRESHOLDS.NORMAL_MAX) return '#d97706'; // yellow
    return '#16a34a'; // green
  };

  return (
    <div className={`temperature-history-chart ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Silo {siloNumber} - Temperature History
        </h3>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Last 24 hours</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Normal (&lt;30°C)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Warning (30-40°C)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Critical (&gt;40°C)</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="timestamp"
            tickFormatter={formatTime}
            stroke="#6b7280"
            fontSize={12}
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
          
          {/* Temperature threshold reference lines */}
          <ReferenceLine 
            y={TEMPERATURE_THRESHOLDS.NORMAL_MAX} 
            stroke="#d97706" 
            strokeDasharray="5 5"
            label={{ value: "Warning (30°C)", position: "top" }}
          />
          <ReferenceLine 
            y={TEMPERATURE_THRESHOLDS.CRITICAL_MIN} 
            stroke="#dc2626" 
            strokeDasharray="5 5"
            label={{ value: "Critical (40°C)", position: "top" }}
          />
          
          <Line 
            type="monotone" 
            dataKey="temperature" 
            stroke={getLineColor()}
            strokeWidth={2}
            dot={{ fill: getLineColor(), strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: getLineColor(), strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Summary statistics */}
      <div className="mt-4 grid grid-cols-4 gap-4 text-center">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-gray-800">
            {data[data.length - 1]?.temperature.toFixed(1) || 'N/A'}°C
          </div>
          <div className="text-xs text-gray-500">Current</div>
        </div>
        <div className="bg-red-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-red-600">
            {Math.max(...data.map(d => d.temperature)).toFixed(1)}°C
          </div>
          <div className="text-xs text-gray-500">Max (24h)</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-blue-600">
            {Math.min(...data.map(d => d.temperature)).toFixed(1)}°C
          </div>
          <div className="text-xs text-gray-500">Min (24h)</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-gray-800">
            {(data.reduce((sum, d) => sum + d.temperature, 0) / data.length).toFixed(1)}°C
          </div>
          <div className="text-xs text-gray-500">Average</div>
        </div>
      </div>
    </div>
  );
};

export default TemperatureHistoryChart;
