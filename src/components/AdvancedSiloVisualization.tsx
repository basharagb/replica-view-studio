import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  Brush,
  Legend,
  ReferenceArea
} from 'recharts';
import { 
  Calendar, 
  Download, 
  Printer, 
  RefreshCw, 
  TrendingUp, 
  AlertTriangle, 
  Search,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Settings,
  Play,
  Pause
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { getAllSiloNumbers, getAlarmedSilos, generateTemperatureHistory } from '@/services/reportService';
import AdvancedExportService, { ExportOptions, ChartExportData } from '@/services/advancedExportService';
import RealTimeService, { RealTimeUpdate } from '@/services/realTimeService';
import { format, differenceInDays, differenceInHours, subDays, subHours } from 'date-fns';

interface TemperatureDataPoint {
  time: string;
  timestamp: number;
  [key: string]: number | string; // Dynamic silo temperature values
}

interface SiloConfig {
  id: number;
  name: string;
  color: string;
  visible: boolean;
  alertLevel: 'normal' | 'warning' | 'critical';
}

interface AdvancedSiloVisualizationProps {
  className?: string;
}

// Color palette for different silos
const SILO_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1',
  '#14b8a6', '#f43f5e', '#22c55e', '#a855f7', '#0ea5e9',
  '#dc2626', '#059669', '#d97706', '#7c3aed', '#0891b2'
];

const AdvancedSiloVisualization: React.FC<AdvancedSiloVisualizationProps> = ({ className }) => {
  // State management
  const [selectedSilos, setSelectedSilos] = useState<number[]>([]);
  const [siloConfigs, setSiloConfigs] = useState<SiloConfig[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [graphData, setGraphData] = useState<TemperatureDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [allSilos, setAllSilos] = useState<number[]>([]);
  const [alarmedSilos, setAlarmedSilos] = useState<Array<{ number: number; status: string }>>([]);
  const [canGenerate, setCanGenerate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Advanced features state
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const [showGrid, setShowGrid] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [zoomDomain, setZoomDomain] = useState<{ left?: number; right?: number }>({});
  const [dataPointLimit, setDataPointLimit] = useState(1000);
  
  // Performance optimization
  const chartRef = useRef<HTMLDivElement>(null);
  const realTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        const silos = getAllSiloNumbers();
        const alarmed = getAlarmedSilos();
        setAllSilos(silos);
        setAlarmedSilos(alarmed);
        
        // Initialize with first 5 silos for demo
        const initialSilos = silos.slice(0, 5);
        setSelectedSilos(initialSilos);
        
        // Create silo configurations
        const configs: SiloConfig[] = initialSilos.map((silo, index) => ({
          id: silo,
          name: `Silo ${silo}`,
          color: SILO_COLORS[index % SILO_COLORS.length],
          visible: true,
          alertLevel: alarmed.find(a => a.number === silo) ? 
            (Math.random() > 0.5 ? 'critical' : 'warning') : 'normal'
        }));
        setSiloConfigs(configs);
        
        // Set default date range (last 7 days)
        const end = new Date();
        const start = subDays(end, 7);
        setEndDate(format(end, 'yyyy-MM-dd'));
        setStartDate(format(start, 'yyyy-MM-dd'));
        
        // Generate initial data
        await generateInitialData(initialSilos, start, end);
      } catch (error) {
        console.error('Error initializing data:', error);
        setError('Failed to initialize visualization data');
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Generate initial data
  const generateInitialData = useCallback(async (silos: number[], start: Date, end: Date) => {
    try {
      const dataPoints: TemperatureDataPoint[] = [];
      const daysDiff = differenceInDays(end, start);
      const hoursDiff = differenceInHours(end, start);
      const isSingleDay = daysDiff === 0;
      
      // Optimize data points based on time range
      let numPoints: number;
      if (isSingleDay) {
        numPoints = Math.min(hoursDiff + 1, 24);
      } else {
        numPoints = Math.min(daysDiff * 4, dataPointLimit); // 4 points per day max
      }
      
      for (let i = 0; i < numPoints; i++) {
        const currentTime = new Date(start.getTime() + (i * (end.getTime() - start.getTime()) / (numPoints - 1)));
        const dataPoint: TemperatureDataPoint = {
          time: format(currentTime, isSingleDay ? 'HH:mm' : 'MMM dd'),
          timestamp: currentTime.getTime()
        };
        
        // Generate temperature data for each silo
        silos.forEach(siloNum => {
          const history = generateTemperatureHistory(siloNum, start, end);
          const historyIndex = Math.floor((i / numPoints) * history.length);
          const tempData = history[historyIndex] || history[0];
          dataPoint[`silo_${siloNum}`] = parseFloat(tempData.maxTemp.toFixed(1));
        });
        
        dataPoints.push(dataPoint);
      }
      
      setGraphData(dataPoints);
    } catch (error) {
      console.error('Error generating initial data:', error);
      setError('Failed to generate temperature data');
    }
  }, [dataPointLimit]);

  // Check if generation is possible
  useEffect(() => {
    setCanGenerate(selectedSilos.length > 0 && startDate !== '' && endDate !== '');
  }, [selectedSilos, startDate, endDate]);

  // Real-time updates
  useEffect(() => {
    if (isRealTimeEnabled && canGenerate) {
      realTimeIntervalRef.current = setInterval(() => {
        handleRefreshData();
      }, refreshInterval * 1000);
    } else if (realTimeIntervalRef.current) {
      clearInterval(realTimeIntervalRef.current);
      realTimeIntervalRef.current = null;
    }

    return () => {
      if (realTimeIntervalRef.current) {
        clearInterval(realTimeIntervalRef.current);
      }
    };
  }, [isRealTimeEnabled, refreshInterval, canGenerate]);

  // Generate graph data
  const generateGraphData = useCallback(async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    setError('');
    
    try {
      // Validate dates
      if (!startDate || !endDate) {
        throw new Error('Start date and end date are required');
      }
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Invalid date format');
      }

      // Simulate API delay with progress
      await new Promise(resolve => setTimeout(resolve, 1000));

      await generateInitialData(selectedSilos, start, end);
      
    } catch (error) {
      console.error('Error generating graph data:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate graph data');
    } finally {
      setIsGenerating(false);
    }
  }, [canGenerate, startDate, endDate, selectedSilos, generateInitialData]);

  // Refresh data
  const handleRefreshData = useCallback(() => {
    if (canGenerate) {
      generateGraphData();
    }
  }, [canGenerate, generateGraphData]);

  // Add silo to visualization
  const addSilo = useCallback((siloNumber: number) => {
    if (!selectedSilos.includes(siloNumber)) {
      const newSelectedSilos = [...selectedSilos, siloNumber];
      setSelectedSilos(newSelectedSilos);
      
      const newConfig: SiloConfig = {
        id: siloNumber,
        name: `Silo ${siloNumber}`,
        color: SILO_COLORS[newSelectedSilos.length % SILO_COLORS.length],
        visible: true,
        alertLevel: alarmedSilos.find(a => a.number === siloNumber) ? 
          (Math.random() > 0.5 ? 'critical' : 'warning') : 'normal'
      };
      
      setSiloConfigs(prev => [...prev, newConfig]);
    }
  }, [selectedSilos, alarmedSilos]);

  // Remove silo from visualization
  const removeSilo = useCallback((siloNumber: number) => {
    setSelectedSilos(prev => prev.filter(s => s !== siloNumber));
    setSiloConfigs(prev => prev.filter(c => c.id !== siloNumber));
  }, []);

  // Toggle silo visibility
  const toggleSiloVisibility = useCallback((siloNumber: number) => {
    setSiloConfigs(prev => prev.map(config => 
      config.id === siloNumber 
        ? { ...config, visible: !config.visible }
        : config
    ));
  }, []);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg"
        >
          <p className="font-medium text-gray-900 mb-2">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => {
            const siloId = parseInt(entry.dataKey.replace('silo_', ''));
            const config = siloConfigs.find(c => c.id === siloId);
            if (!config?.visible) return null;
            
            return (
              <div key={index} className="flex items-center gap-2 mb-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-700">
                  {config.name}: {entry.value}°C
                </span>
                {config.alertLevel !== 'normal' && (
                  <Badge 
                    variant={config.alertLevel === 'critical' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {config.alertLevel}
                  </Badge>
                )}
              </div>
            );
          })}
        </motion.div>
      );
    }
    return null;
  };

  // Filter silos based on search
  const filteredSilos = useMemo(() => {
    return allSilos.filter(silo => 
      silo.toString().includes(searchTerm) ||
      `Silo ${silo}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allSilos, searchTerm]);

  // Visible silo configs
  const visibleSiloConfigs = useMemo(() => {
    return siloConfigs.filter(config => config.visible);
  }, [siloConfigs]);

  // Services
  const exportService = AdvancedExportService.getInstance();
  const realTimeService = RealTimeService.getInstance();
  
  // Real-time subscription
  const [realTimeSubscriptionId, setRealTimeSubscriptionId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState({ connected: false, lastUpdate: 0 });

  // Export functionality
  const exportToPDF = useCallback(async () => {
    if (!chartRef.current || graphData.length === 0) return;
    
    try {
      const chartElement = chartRef.current;
      const exportData: ChartExportData = {
        title: 'Advanced Silo Temperature Visualization',
        dateRange: startDate && endDate ? `${format(new Date(startDate), 'MMM dd, yyyy')} - ${format(new Date(endDate), 'MMM dd, yyyy')}` : 'Not specified',
        silos: selectedSilos,
        dataPoints: graphData,
        chartType: 'line',
        metadata: {
          generatedAt: new Date().toISOString(),
          totalDataPoints: graphData.length,
          timeRange: `${graphData.length} data points`,
          alertCount: siloConfigs.filter(c => c.alertLevel !== 'normal').length
        }
      };
      
      const options: ExportOptions = {
        format: 'pdf',
        resolution: 300,
        orientation: 'landscape',
        includeMetadata: true,
        includeWatermark: true,
        customTitle: 'Temperature Analytics Report'
      };
      
      await exportService.exportToPDF(chartElement, exportData, options);
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export PDF. Please try again.');
    }
  }, [chartRef, graphData, startDate, endDate, selectedSilos, siloConfigs, exportService]);

  const exportToPNG = useCallback(async () => {
    if (!chartRef.current || graphData.length === 0) return;
    
    try {
      const chartElement = chartRef.current;
      const exportData: ChartExportData = {
        title: 'Advanced Silo Temperature Visualization',
        dateRange: startDate && endDate ? `${format(new Date(startDate), 'MMM dd, yyyy')} - ${format(new Date(endDate), 'MMM dd, yyyy')}` : 'Not specified',
        silos: selectedSilos,
        dataPoints: graphData,
        chartType: 'line',
        metadata: {
          generatedAt: new Date().toISOString(),
          totalDataPoints: graphData.length,
          timeRange: `${graphData.length} data points`
        }
      };
      
      const options: ExportOptions = {
        format: 'png',
        resolution: 300,
        orientation: 'landscape',
        includeMetadata: false,
        includeWatermark: false
      };
      
      await exportService.exportToPNG(chartElement, exportData, options);
    } catch (error) {
      console.error('PNG export failed:', error);
      setError('Failed to export PNG. Please try again.');
    }
  }, [chartRef, graphData, startDate, endDate, selectedSilos, exportService]);

  const printChart = useCallback(() => {
    if (!chartRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const chartElement = chartRef.current;
    const chartHTML = chartElement.outerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Temperature Analytics Chart</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            .header { text-align: center; margin-bottom: 20px; }
            .chart-container { width: 100%; height: 600px; }
            @media print {
              body { margin: 0; }
              .chart-container { height: 500px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Advanced Silo Temperature Visualization</h1>
            <p>Date Range: ${startDate && endDate ? `${format(new Date(startDate), 'MMM dd, yyyy')} - ${format(new Date(endDate), 'MMM dd, yyyy')}` : 'Not specified'}</p>
            <p>Silos: ${selectedSilos.join(', ')}</p>
            <p>Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}</p>
          </div>
          <div class="chart-container">
            ${chartHTML}
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 1000);
  }, [chartRef, startDate, endDate, selectedSilos]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Silo Temperature Analytics</h2>
          <p className="text-gray-600">Interactive real-time temperature monitoring with advanced visualization</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefreshData}
            disabled={isGenerating || !canGenerate}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button onClick={exportToPDF} size="sm" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          
          <Button onClick={exportToPNG} size="sm" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export PNG
          </Button>
          
          <Button onClick={printChart} size="sm" variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          
          {isRealTimeEnabled && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-md">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-700">Live Updates</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Visualization Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Silo Selection */}
            <div>
              <Label>Silo Selection</Label>
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search silos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>
                
                <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                    {filteredSilos.slice(0, 50).map(silo => (
                      <Button
                        key={silo}
                        size="sm"
                        variant={selectedSilos.includes(silo) ? "default" : "outline"}
                        onClick={() => selectedSilos.includes(silo) ? removeSilo(silo) : addSilo(silo)}
                        className="text-xs"
                      >
                        {silo}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="realtime"
                  checked={isRealTimeEnabled}
                  onCheckedChange={setIsRealTimeEnabled}
                />
                <Label htmlFor="realtime">Real-time Updates</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="grid"
                  checked={showGrid}
                  onCheckedChange={setShowGrid}
                />
                <Label htmlFor="grid">Show Grid</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="legend"
                  checked={showLegend}
                  onCheckedChange={setShowLegend}
                />
                <Label htmlFor="legend">Show Legend</Label>
              </div>
              
              <div>
                <Label>Refresh Interval (s)</Label>
                <Select value={refreshInterval.toString()} onValueChange={(v) => setRefreshInterval(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10s</SelectItem>
                    <SelectItem value="30">30s</SelectItem>
                    <SelectItem value="60">60s</SelectItem>
                    <SelectItem value="300">5m</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={generateGraphData}
              disabled={!canGenerate || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Generate Visualization
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Silo Controls */}
      {siloConfigs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Silos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {siloConfigs.map(config => (
                  <motion.div
                    key={config.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`flex items-center justify-between p-3 border rounded-lg ${
                      config.visible ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                      <span className={`font-medium ${config.visible ? 'text-gray-900' : 'text-gray-500'}`}>
                        {config.name}
                      </span>
                      {config.alertLevel !== 'normal' && (
                        <Badge 
                          variant={config.alertLevel === 'critical' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {config.alertLevel}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleSiloVisibility(config.id)}
                      >
                        {config.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeSilo(config.id)}
                      >
                        ×
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </motion.div>
      )}

      {/* Chart */}
      <AnimatePresence>
        {graphData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Temperature Trends</CardTitle>
                  <div className="flex items-center gap-2">
                    {isRealTimeEnabled && (
                      <Badge variant="secondary" className="animate-pulse">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                        Live
                      </Badge>
                    )}
                    <span className="text-sm text-gray-500">
                      {graphData.length} data points
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      ref={chartRef}
                      data={graphData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
                      <XAxis 
                        dataKey="time" 
                        stroke="#666"
                        fontSize={12}
                        tickMargin={10}
                      />
                      <YAxis 
                        stroke="#666"
                        fontSize={12}
                        tickMargin={10}
                        domain={['dataMin - 5', 'dataMax + 5']}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      {showLegend && <Legend />}
                      
                      {/* Temperature threshold lines */}
                      <ReferenceLine y={35} stroke="#f59e0b" strokeDasharray="5 5" />
                      <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="5 5" />
                      
                      {/* Silo temperature lines */}
                      {visibleSiloConfigs.map(config => (
                        <Line
                          key={config.id}
                          type="monotone"
                          dataKey={`silo_${config.id}`}
                          stroke={config.color}
                          strokeWidth={2}
                          dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: config.color, strokeWidth: 2 }}
                          name={config.name}
                          animationDuration={animationSpeed}
                          connectNulls={false}
                        />
                      ))}
                      
                      {/* Brush for zooming */}
                      <Brush 
                        dataKey="time" 
                        height={30} 
                        stroke="#8884d8"
                        startIndex={zoomDomain.left}
                        endIndex={zoomDomain.right}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center h-64"
        >
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Loading visualization data...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdvancedSiloVisualization;
