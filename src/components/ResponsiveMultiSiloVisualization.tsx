import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Brush
} from 'recharts';
import { 
  Eye, 
  EyeOff, 
  Download, 
  Printer, 
  RefreshCw, 
  Zap, 
  TrendingUp,
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import EnhancedSearchableDropdown, { DropdownOption } from './EnhancedSearchableDropdown';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import '../styles/responsive.css';

interface TemperatureReading {
  time: string;
  timestamp: number;
  [key: string]: number | string; // Dynamic silo data
}

interface SiloConfig {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  alertLevel: 'normal' | 'warning' | 'critical';
  currentTemp: number;
  description?: string;
  group?: string;
}

interface AlertEvent {
  id: string;
  siloId: string;
  siloName: string;
  type: 'warning' | 'critical';
  temperature: number;
  timestamp: number;
  message: string;
}

interface ResponsiveMultiSiloVisualizationProps {
  silos?: SiloConfig[];
  data?: TemperatureReading[];
  alerts?: AlertEvent[];
  onSiloSelectionChange?: (selectedSilos: string[]) => void;
  onAlertGenerated?: (alert: AlertEvent) => void;
  realTimeEnabled?: boolean;
  updateInterval?: number;
  className?: string;
}

// Predefined color palette for silos
const SILO_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  '#14B8A6', '#F43F5E', '#8B5A2B', '#7C3AED', '#DC2626',
  '#059669', '#D97706', '#7C2D12', '#4338CA', '#BE185D'
];

// Temperature thresholds
const TEMP_THRESHOLDS = {
  WARNING: 30,
  CRITICAL: 40
};

export const ResponsiveMultiSiloVisualization: React.FC<ResponsiveMultiSiloVisualizationProps> = ({
  silos = [],
  data = [],
  alerts = [],
  onSiloSelectionChange,
  onAlertGenerated,
  realTimeEnabled = false,
  updateInterval = 30000,
  className = ""
}) => {
  const [selectedSilos, setSelectedSilos] = useState<string[]>([]);
  const [siloConfigs, setSiloConfigs] = useState<SiloConfig[]>([]);
  const [temperatureData, setTemperatureData] = useState<TemperatureReading[]>([]);
  const [currentAlerts, setCurrentAlerts] = useState<AlertEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Initialize silo configurations
  useEffect(() => {
    if (silos.length > 0) {
      const configs = silos.map((silo, index) => ({
        ...silo,
        color: silo.color || SILO_COLORS[index % SILO_COLORS.length],
        visible: true,
        alertLevel: getAlertLevel(silo.currentTemp) as 'normal' | 'warning' | 'critical'
      }));
      setSiloConfigs(configs);
      setSelectedSilos(configs.slice(0, 5).map(s => s.id)); // Select first 5 by default
    } else {
      // Generate sample silos if none provided
      generateSampleSilos();
    }
  }, [silos]);

  // Initialize data
  useEffect(() => {
    if (data.length > 0) {
      setTemperatureData(data);
    } else {
      generateSampleData();
    }
  }, [data, selectedSilos]);

  // Initialize alerts
  useEffect(() => {
    setCurrentAlerts(alerts);
  }, [alerts]);

  // Generate sample silos for demo
  const generateSampleSilos = useCallback(() => {
    const sampleSilos: SiloConfig[] = Array.from({ length: 20 }, (_, i) => {
      const siloNumber = i + 1;
      const currentTemp = 15 + Math.random() * 35; // 15-50°C range
      return {
        id: `silo-${siloNumber}`,
        name: `Silo ${siloNumber}`,
        description: `Temperature monitoring for Silo ${siloNumber}`,
        color: SILO_COLORS[i % SILO_COLORS.length],
        visible: true,
        alertLevel: getAlertLevel(currentTemp) as 'normal' | 'warning' | 'critical',
        currentTemp: Math.round(currentTemp * 10) / 10,
        group: i < 10 ? 'Zone A' : 'Zone B'
      };
    });
    setSiloConfigs(sampleSilos);
    setSelectedSilos(sampleSilos.slice(0, 3).map(s => s.id));
  }, []);

  // Generate sample temperature data
  const generateSampleData = useCallback(() => {
    if (selectedSilos.length === 0) return;

    const now = new Date();
    const dataPoints = 48; // Last 24 hours with 30-minute intervals
    const newData: TemperatureReading[] = [];

    for (let i = dataPoints - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 30 * 60 * 1000);
      const dataPoint: TemperatureReading = {
        time: format(timestamp, 'HH:mm'),
        timestamp: timestamp.getTime()
      };

      selectedSilos.forEach(siloId => {
        const silo = siloConfigs.find(s => s.id === siloId);
        if (silo) {
          // Generate realistic temperature variation
          const baseTemp = silo.currentTemp;
          const variation = (Math.random() - 0.5) * 8; // ±4°C variation
          const temp = Math.max(10, Math.min(60, baseTemp + variation));
          dataPoint[siloId] = Math.round(temp * 10) / 10;

          // Generate alerts for critical temperatures
          if (temp > TEMP_THRESHOLDS.CRITICAL && Math.random() < 0.1) {
            const alert: AlertEvent = {
              id: `alert-${Date.now()}-${siloId}`,
              siloId,
              siloName: silo.name,
              type: 'critical',
              temperature: temp,
              timestamp: timestamp.getTime(),
              message: `Critical temperature detected: ${temp}°C`
            };
            if (onAlertGenerated) {
              onAlertGenerated(alert);
            }
          }
        }
      });

      newData.push(dataPoint);
    }

    setTemperatureData(newData);
    setLastUpdate(new Date());
  }, [selectedSilos, siloConfigs, onAlertGenerated]);

  // Get alert level based on temperature
  const getAlertLevel = (temp: number): string => {
    if (temp >= TEMP_THRESHOLDS.CRITICAL) return 'critical';
    if (temp >= TEMP_THRESHOLDS.WARNING) return 'warning';
    return 'normal';
  };

  // Handle silo selection change
  const handleSiloSelectionChange = useCallback((selected: string | number | (string | number)[]) => {
    const newSelection = Array.isArray(selected) ? selected.map(String) : [String(selected)];
    setSelectedSilos(newSelection);
    if (onSiloSelectionChange) {
      onSiloSelectionChange(newSelection);
    }
  }, [onSiloSelectionChange]);

  // Toggle silo visibility
  const toggleSiloVisibility = useCallback((siloId: string) => {
    setSiloConfigs(prev => prev.map(silo => 
      silo.id === siloId ? { ...silo, visible: !silo.visible } : silo
    ));
  }, []);

  // Prepare dropdown options
  const dropdownOptions: DropdownOption[] = useMemo(() => {
    return siloConfigs.map(silo => ({
      id: silo.id,
      label: silo.name,
      description: silo.description,
      group: silo.group
    }));
  }, [siloConfigs]);

  // Get visible silos for chart
  const visibleSilos = useMemo(() => {
    return siloConfigs.filter(silo => 
      selectedSilos.includes(silo.id) && silo.visible
    );
  }, [siloConfigs, selectedSilos]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">Time: {label}</p>
          {payload.map((entry: any, index: number) => {
            const silo = siloConfigs.find(s => s.id === entry.dataKey);
            return (
              <div key={index} className="flex items-center gap-2 mb-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm">
                  {silo?.name}: <span className="font-semibold">{entry.value}°C</span>
                </span>
                <Badge 
                  variant={getAlertLevel(entry.value) === 'critical' ? 'destructive' : 
                          getAlertLevel(entry.value) === 'warning' ? 'secondary' : 'default'}
                  className="text-xs"
                >
                  {getAlertLevel(entry.value)}
                </Badge>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Real-time updates
  useEffect(() => {
    if (!realTimeEnabled) return;

    const interval = setInterval(() => {
      generateSampleData();
    }, updateInterval);

    return () => clearInterval(interval);
  }, [realTimeEnabled, updateInterval, generateSampleData]);

  // Export functions
  const exportToPDF = useCallback(() => {
    // Implementation would use html2canvas and jsPDF
    console.log('Exporting to PDF...');
  }, []);

  const exportToPNG = useCallback(() => {
    // Implementation would use html2canvas
    console.log('Exporting to PNG...');
  }, []);

  const printChart = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className={`responsive-multi-silo-container ${className}`}>
      {/* Mobile Menu Button */}
      <div className="show-mobile mb-4">
        <Button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <Menu className="w-4 h-4 mr-2" />
          {isMobileMenuOpen ? 'Hide Controls' : 'Show Controls'}
        </Button>
      </div>

      {/* Controls Panel */}
      <AnimatePresence>
        {(isMobileMenuOpen || window.innerWidth > 768) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="controls-panel mb-6"
          >
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Multi-Silo Temperature Monitoring</CardTitle>
                  <div className="flex items-center gap-2">
                    {realTimeEnabled && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
                        Live
                      </Badge>
                    )}
                    <span className="text-sm text-gray-500">
                      Last updated: {format(lastUpdate, 'HH:mm:ss')}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Silo Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Silos
                    </label>
                    <EnhancedSearchableDropdown
                      options={dropdownOptions}
                      value={selectedSilos}
                      onChange={handleSiloSelectionChange}
                      multiSelect
                      showSelectAll
                      showClearAll
                      groupBy
                      placeholder="Select silos to monitor..."
                      searchPlaceholder="Search silos..."
                      className="w-full"
                    />
                  </div>

                  {/* Export Controls */}
                  <div className="flex flex-col gap-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Export Options
                    </label>
                    <div className="flex gap-2">
                      <Button onClick={exportToPDF} size="sm" variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                      </Button>
                      <Button onClick={exportToPNG} size="sm" variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        PNG
                      </Button>
                      <Button onClick={printChart} size="sm" variant="outline" className="flex-1">
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                      </Button>
                    </div>
                  </div>

                  {/* Refresh Control */}
                  <div className="flex flex-col gap-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Control
                    </label>
                    <Button 
                      onClick={generateSampleData} 
                      size="sm" 
                      variant="outline"
                      disabled={isLoading}
                      className="w-full"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      Refresh Data
                    </Button>
                  </div>
                </div>

                {/* Silo Legend */}
                {visibleSilos.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Active Silos ({visibleSilos.length})
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {visibleSilos.map(silo => (
                        <motion.div
                          key={silo.id}
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border"
                        >
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: silo.color }}
                          />
                          <span className="text-sm font-medium">{silo.name}</span>
                          <span className="text-sm text-gray-500">
                            {silo.currentTemp}°C
                          </span>
                          <Badge 
                            variant={silo.alertLevel === 'critical' ? 'destructive' : 
                                    silo.alertLevel === 'warning' ? 'secondary' : 'default'}
                            className="text-xs"
                          >
                            {silo.alertLevel}
                          </Badge>
                          <Button
                            onClick={() => toggleSiloVisibility(silo.id)}
                            size="sm"
                            variant="ghost"
                            className="p-1 h-auto"
                          >
                            {silo.visible ? 
                              <Eye className="w-4 h-4" /> : 
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            }
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Temperature Chart */}
      <Card>
        <CardContent className="p-6">
          <div className="chart-container" style={{ height: 'var(--chart-height-desktop)' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={temperatureData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="time" 
                  stroke="#666"
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="#666"
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />

                {/* Temperature threshold lines */}
                <ReferenceLine 
                  y={TEMP_THRESHOLDS.WARNING} 
                  stroke="#F59E0B" 
                  strokeDasharray="5 5"
                  label={{ value: "Warning (30°C)", position: "topRight" }}
                />
                <ReferenceLine 
                  y={TEMP_THRESHOLDS.CRITICAL} 
                  stroke="#EF4444" 
                  strokeDasharray="5 5"
                  label={{ value: "Critical (40°C)", position: "topRight" }}
                />

                {/* Temperature lines for each visible silo */}
                {visibleSilos.map(silo => (
                  <Line
                    key={silo.id}
                    type="monotone"
                    dataKey={silo.id}
                    stroke={silo.color}
                    strokeWidth={2}
                    name={silo.name}
                    dot={{ fill: silo.color, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: silo.color, strokeWidth: 2 }}
                    connectNulls={false}
                  />
                ))}

                {/* Brush for zooming */}
                <Brush 
                  dataKey="time" 
                  height={30}
                  stroke="#8884d8"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      {currentAlerts.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Recent Alerts ({currentAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {currentAlerts.slice(0, 5).map(alert => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={alert.type === 'critical' ? 'destructive' : 'secondary'}>
                      {alert.type}
                    </Badge>
                    <span className="font-medium">{alert.siloName}</span>
                    <span className="text-sm text-gray-600">{alert.message}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {format(new Date(alert.timestamp), 'HH:mm:ss')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResponsiveMultiSiloVisualization;
