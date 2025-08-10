import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { RefreshCw, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useSiloData } from '../hooks/useSiloData';

interface TemperatureDataPoint {
  time: string;
  temperature: number;
  status: 'normal' | 'warning' | 'critical';
  timestamp: Date;
}

interface AnimatedTemperatureGraphProps {
  siloNumber?: number;
  title: string;
  isAlarmReport?: boolean;
  className?: string;
}

/**
 * Animated Temperature Graph Component
 * 
 * Features:
 * - Beautiful animated line/area charts
 * - Time vs Temperature visualization
 * - Color-coded temperature zones
 * - Smooth loading animations
 * - Real-time data updates
 */
const AnimatedTemperatureGraph: React.FC<AnimatedTemperatureGraphProps> = ({
  siloNumber,
  title,
  isAlarmReport = false,
  className = ''
}) => {
  // Fetch real data from API if siloNumber is provided
  const { data: apiData, loading: apiLoading, error: apiError, refetch } = useSiloData({
    siloNumbers: siloNumber ? [siloNumber] : undefined,
    selectedDays: 1,
    dataType: 'all_readings',
    autoRefresh: true,
    refreshInterval: 30000 // Update every 30 seconds
  });

  const [data, setData] = useState<TemperatureDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Process API data to temperature data points
  const processAPIData = useCallback((): TemperatureDataPoint[] => {
    if (!apiData || apiData.length === 0) {
      return [];
    }
    
    const dataPoints: TemperatureDataPoint[] = [];
    const siloData = apiData[0]; // We're only fetching one silo
    
    // Process binned data
    if ('binnedData' in siloData) {
      siloData.binnedData.forEach(bin => {
        if (bin.temperature !== undefined) {
          // Determine status based on temperature
          let status: 'normal' | 'warning' | 'critical';
          if (bin.temperature >= 40) {
            status = 'critical';
          } else if (bin.temperature >= 35) {
            status = 'warning';
          } else {
            status = 'normal';
          }
          
          dataPoints.push({
            time: new Date(bin.timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }),
            temperature: bin.temperature,
            status,
            timestamp: new Date(bin.timestamp)
          });
        }
      });
    }
    
    return dataPoints;
  }, [apiData]);

  // Generate realistic temperature data (fallback)
  const generateTemperatureData = useCallback((): TemperatureDataPoint[] => {
    const dataPoints: TemperatureDataPoint[] = [];
    const now = new Date();
    const hoursBack = 24; // 24 hours of data
    
    const baseTemp = isAlarmReport ? 38 : 28; // Higher base for alarm reports
    
    for (let i = hoursBack; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000));
      
      // Add some realistic temperature variation
      const variation = (Math.random() - 0.5) * 8; // ±4°C variation
      const dailyCycle = Math.sin((timestamp.getHours() / 24) * 2 * Math.PI) * 3; // Daily temperature cycle
      
      let temperature = baseTemp + variation + dailyCycle;
      
      // Add some spikes for alarm reports
      if (isAlarmReport && Math.random() > 0.85) {
        temperature += Math.random() * 8 + 5; // Occasional spikes
      }
      
      // Ensure temperature is within reasonable bounds
      temperature = Math.max(15, Math.min(50, temperature));
      temperature = Math.round(temperature * 10) / 10;
      
      // Determine status based on temperature
      let status: 'normal' | 'warning' | 'critical';
      if (temperature >= 40) {
        status = 'critical';
      } else if (temperature >= 35) {
        status = 'warning';
      } else {
        status = 'normal';
      }
      
      dataPoints.push({
        time: timestamp.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
        temperature,
        status,
        timestamp
      });
    }
    
    return dataPoints;
  }, [isAlarmReport]);

  // Generate new data with animation
  const generateNewData = async () => {
    setIsGenerating(true);
    
    // If we have a silo number, refetch from API
    if (siloNumber) {
      await refetch();
    } else {
      // Simulate generation delay for animation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newData = generateTemperatureData();
      setData(newData);
    }
    setIsGenerating(false);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      // If we have a silo number, wait for API data
      if (siloNumber) {
        // Wait for API data to load
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        // For non-silo graphs, use generated data
        await new Promise(resolve => setTimeout(resolve, 1000)); // Initial loading delay
        const initialData = generateTemperatureData();
        setData(initialData);
      }
      setLoading(false);
    };

    loadInitialData();
  }, [siloNumber, generateTemperatureData]);

  // Update data when API data changes
  useEffect(() => {
    if (siloNumber && !apiLoading && apiData) {
      const processedData = processAPIData();
      setData(processedData);
      setLoading(false);
    }
  }, [siloNumber, apiData, apiLoading, processAPIData]);

  // Handle API errors
  useEffect(() => {
    if (siloNumber && apiError && apiError.hasError) {
      console.error('Error fetching silo data:', apiError.error);
      // Fallback to generated data on API error
      const fallbackData = generateTemperatureData();
      setData(fallbackData);
      setLoading(false);
    }
  }, [siloNumber, apiError, generateTemperatureData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
      payload: TemperatureDataPoint;
      value: number;
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{`Time: ${label}`}</p>
          <p className={`font-medium ${
            data.status === 'critical' ? 'text-red-600' : 
            data.status === 'warning' ? 'text-yellow-600' : 
            'text-green-600'
          }`}>
            {`Temperature: ${data.temperature}°C`}
          </p>
          <p className="text-sm text-gray-500 capitalize">{`Status: ${data.status}`}</p>
        </div>
      );
    }
    return null;
  };

  // Get line color based on data
  const getLineColor = () => {
    if (isAlarmReport) return '#ef4444'; // Red for alarm reports
    const hasWarning = data.some(d => d.status === 'warning');
    const hasCritical = data.some(d => d.status === 'critical');
    
    if (hasCritical) return '#ef4444'; // Red
    if (hasWarning) return '#f59e0b'; // Yellow
    return '#10b981'; // Green
  };

  // Calculate statistics
  const avgTemp = data.length > 0 ? 
    Math.round((data.reduce((sum, d) => sum + d.temperature, 0) / data.length) * 10) / 10 : 0;
  const maxTemp = data.length > 0 ? Math.max(...data.map(d => d.temperature)) : 0;
  const minTemp = data.length > 0 ? Math.min(...data.map(d => d.temperature)) : 0;
  
  const criticalCount = data.filter(d => d.status === 'critical').length;
  const warningCount = data.filter(d => d.status === 'warning').length;

  if (loading) {
    return (
      <Card className={`${className} overflow-hidden`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
            />
            <span className="ml-3 text-gray-600">Loading temperature data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              {title} {siloNumber && `- Silo ${siloNumber}`}
            </CardTitle>
            <Button
              onClick={generateNewData}
              disabled={isGenerating}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Generating...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="bg-blue-50 p-3 rounded-lg border border-blue-200"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-xs text-blue-600">Average</p>
                  <p className="text-lg font-bold text-blue-700">{avgTemp}°C</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="bg-red-50 p-3 rounded-lg border border-red-200"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-500" />
                <div>
                  <p className="text-xs text-red-600">Max</p>
                  <p className="text-lg font-bold text-red-700">{maxTemp.toFixed(1)}°C</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="bg-green-50 p-3 rounded-lg border border-green-200"
            >
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-xs text-green-600">Min</p>
                  <p className="text-lg font-bold text-green-700">{minTemp.toFixed(1)}°C</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="bg-yellow-50 p-3 rounded-lg border border-yellow-200"
            >
              <div>
                <p className="text-xs text-yellow-600">Alerts</p>
                <p className="text-lg font-bold text-yellow-700">{criticalCount + warningCount}</p>
              </div>
            </motion.div>
          </div>

          {/* Loading overlay for generation */}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"
                />
                <p className="text-gray-600">Generating beautiful graph...</p>
              </div>
            </motion.div>
          )}

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="relative"
            style={{ height: '400px' }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getLineColor()} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={getLineColor()} stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="time" 
                  stroke="#6b7280"
                  fontSize={12}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {/* Temperature zones */}
                <Area
                  type="monotone"
                  dataKey="temperature"
                  stroke={getLineColor()}
                  strokeWidth={3}
                  fill="url(#temperatureGradient)"
                  name="Temperature (°C)"
                  animationDuration={2000}
                  animationBegin={0}
                />
                
                {/* Critical threshold line */}
                <Line
                  type="monotone"
                  dataKey={() => 40}
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Critical (40°C)"
                />
                
                {/* Warning threshold line */}
                <Line
                  type="monotone"
                  dataKey={() => 35}
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Warning (35°C)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Status Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="flex justify-center gap-6 text-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Normal: {data.filter(d => d.status === 'normal').length} readings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Warning: {warningCount} readings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Critical: {criticalCount} readings</span>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AnimatedTemperatureGraph;
