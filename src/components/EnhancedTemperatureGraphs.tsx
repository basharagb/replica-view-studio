import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Search, Calendar, AlertTriangle, Download, Printer, RefreshCw } from 'lucide-react';
import { generateTemperatureHistory } from '@/services/reportService';
import { getAllSiloNumbers, getAlarmedSilos } from '@/services/reportService';
import { format, differenceInDays, differenceInHours } from 'date-fns';

// Color palette for different silos
const SILO_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1',
  '#14b8a6', '#eab308', '#dc2626', '#059669', '#7c3aed'
];

interface TemperatureDataPoint {
  time: string;
  temperature: number;
  status: 'normal' | 'warning' | 'critical';
  [key: string]: string | number;
}

interface EnhancedTemperatureGraphsProps {
  className?: string;
}

const EnhancedTemperatureGraphs: React.FC<EnhancedTemperatureGraphsProps> = ({ className }) => {
  // State management
  const [activeTab, setActiveTab] = useState<'silo' | 'alerts'>('silo');
  const [selectedSilo, setSelectedSilo] = useState<number | null>(null);
  const [selectedAlertSilos, setSelectedAlertSilos] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [graphData, setGraphData] = useState<TemperatureDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [canGenerate, setCanGenerate] = useState(false);
  const [hasGeneralGraph, setHasGeneralGraph] = useState(false);
  const [alertSearchTerm, setAlertSearchTerm] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  // Get available silos
  const allSilos = getAllSiloNumbers();
  const alertSilos = getAlarmedSilos();
  
  // Filter alert silos based on search terms
  
  const filteredAlertSilos = alertSilos.filter(silo => 
    silo.number.toString().includes(alertSearchTerm)
  );

  // Progressive UI enabling logic
  useEffect(() => {
    if (activeTab === 'silo') {
      setCanGenerate(selectedSilo !== null && startDate !== '' && endDate !== '');
    } else {
      setCanGenerate(selectedAlertSilos.length > 0 && startDate !== '' && endDate !== '');
    }
  }, [activeTab, selectedSilo, selectedAlertSilos, startDate, endDate]);
  
  // Generate default general graph
  const generateDefaultGraph = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Generate general graph for last 7 days with sample silos
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      const sampleSilos = allSilos.slice(0, 5); // First 5 silos as sample
      
      const generalData: TemperatureDataPoint[] = [];
      const dataPoints = 7; // One point per day
      
      for (let i = 0; i < dataPoints; i++) {
        const currentTime = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
        let totalTemp = 0;
        let maxStatus: 'normal' | 'warning' | 'critical' = 'normal';
        
        sampleSilos.forEach(siloNum => {
          const history = generateTemperatureHistory(siloNum, startDate, endDate);
          const dataPoint = history[Math.floor((i / dataPoints) * history.length)] || history[0];
          totalTemp += dataPoint.maxTemp;
          
          const status = dataPoint.maxTemp > 40 ? 'critical' : dataPoint.maxTemp >= 30 ? 'warning' : 'normal';
          if (status === 'critical' || (status === 'warning' && maxStatus === 'normal')) {
            maxStatus = status;
          }
        });
        
        generalData.push({
          time: format(currentTime, 'MMM dd'),
          temperature: totalTemp / sampleSilos.length,
          status: maxStatus
        });
      }
      
      setGraphData(generalData);
    } catch (error) {
      console.error('Error generating default graph:', error);
    } finally {
      setIsLoading(false);
    }
  }, [allSilos]);

  // Generate default general graph on first load
  useEffect(() => {
    if (!hasGeneralGraph) {
      generateDefaultGraph();
      setHasGeneralGraph(true);
    }
  }, [hasGeneralGraph, generateDefaultGraph]);

  // Generate temperature data
  const generateGraphData = useCallback(async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    setIsLoading(true);
    
    try {
      // Validate dates before creating Date objects
      if (!startDate || !endDate) {
        throw new Error('Start date and end date are required');
      }
      
      // Generate combined data for multiple silos or single silo
      const combinedData: TemperatureDataPoint[] = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Check if dates are valid
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Invalid date format');
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const silosToProcess = activeTab === 'silo' 
        ? [selectedSilo!] 
        : selectedAlertSilos;
      
      // Enhanced dynamic time scale based on date range
      const daysDiff = differenceInDays(end, start);
      const hoursDiff = differenceInHours(end, start);
      const isSingleDay = daysDiff === 0;
      const isVeryShortPeriod = daysDiff <= 1; // Same day or next day
      const isShortPeriod = daysDiff <= 3; // 1-3 days
      const isMediumPeriod = daysDiff <= 7; // 1 week
      const isLongPeriod = daysDiff <= 30; // 1 month
      
      // Dynamic data points and time format based on date range
      let dataPoints: number;
      let timeFormat: string;
      let timeInterval: number; // milliseconds between data points
      
      if (isSingleDay) {
        // Same day: show hours with minutes for precision
        dataPoints = Math.min(hoursDiff + 1, 24);
        timeFormat = 'HH:mm';
        timeInterval = 60 * 60 * 1000; // 1 hour
      } else if (isVeryShortPeriod) {
        // 1-2 days: show hours with date and time
        dataPoints = Math.min(hoursDiff + 1, 48);
        timeFormat = 'MMM dd HH:mm';
        timeInterval = 60 * 60 * 1000; // 1 hour
      } else if (isShortPeriod) {
        // 2-3 days: show hours with date for better granularity
        dataPoints = Math.min(hoursDiff + 1, 72);
        timeFormat = 'MMM dd HH:mm';
        timeInterval = 60 * 60 * 1000; // 1 hour
      } else if (isMediumPeriod) {
        // 4-7 days: show daily readings with date
        dataPoints = daysDiff + 1;
        timeFormat = 'MMM dd';
        timeInterval = 24 * 60 * 60 * 1000; // 1 day
      } else if (isLongPeriod) {
        // 1-4 weeks: show daily readings
        dataPoints = daysDiff + 1;
        timeFormat = 'MMM dd';
        timeInterval = 24 * 60 * 60 * 1000; // 1 day
      } else {
        // More than 1 month: show weekly aggregation
        dataPoints = Math.ceil(daysDiff / 7);
        timeFormat = 'MMM dd';
        timeInterval = 7 * 24 * 60 * 60 * 1000; // 1 week
      }

      for (let i = 0; i < dataPoints; i++) {
        const currentTime = new Date(start.getTime() + (i * timeInterval));
        
        if (activeTab === 'silo') {
          // Single silo data
          const history = generateTemperatureHistory(selectedSilo!, start, end);
          const dataPoint = history[Math.floor((i / dataPoints) * history.length)] || history[0];
          
          combinedData.push({
            time: format(currentTime, timeFormat),
            temperature: dataPoint.maxTemp,
            status: dataPoint.maxTemp > 40 ? 'critical' : dataPoint.maxTemp >= 30 ? 'warning' : 'normal'
          });
        } else {
          // Multiple silos - create data point with individual silo temperatures
          const dataPoint: TemperatureDataPoint = {
            time: format(currentTime, timeFormat),
            temperature: 0, // Will be average
            status: 'normal' as 'normal' | 'warning' | 'critical'
          };
          
          let totalTemp = 0;
          let maxStatus: 'normal' | 'warning' | 'critical' = 'normal';
          
          silosToProcess.forEach(siloNum => {
            const history = generateTemperatureHistory(siloNum, start, end);
            const historyPoint = history[Math.floor((i / dataPoints) * history.length)] || history[0];
            const temp = historyPoint.maxTemp;
            
            // Add individual silo temperature to data point
            dataPoint[`silo_${siloNum}`] = temp;
            totalTemp += temp;
            
            const status = temp > 40 ? 'critical' : temp >= 30 ? 'warning' : 'normal';
            if (status === 'critical' || (status === 'warning' && maxStatus === 'normal')) {
              maxStatus = status;
            }
          });
          
          dataPoint.temperature = totalTemp / silosToProcess.length;
          dataPoint.status = maxStatus;
          combinedData.push(dataPoint);
        }
      }

      setGraphData(combinedData);
    } catch (error) {
      console.error('Error generating graph data:', error);
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  }, [activeTab, selectedSilo, selectedAlertSilos, startDate, endDate, canGenerate]);

  // Handle silo selection for alerts tab
  const handleAlertSiloToggle = (siloNumber: number) => {
    setSelectedAlertSilos(prev => 
      prev.includes(siloNumber) 
        ? prev.filter(s => s !== siloNumber)
        : [...prev, siloNumber]
    );
  };

  const handleSelectAllAlerts = () => {
    setSelectedAlertSilos(filteredAlertSilos.map(s => s.number));
  };

  const handleClearAllAlerts = () => {
    setSelectedAlertSilos([]);
  };

  // Export functions
  const exportToPDF = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const newWindow = window.open('', '_blank');
    if (!newWindow) return;

    const title = activeTab === 'silo' 
      ? `Silo ${selectedSilo} Temperature Graph`
      : `Alert Silos Temperature Graph`;

    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .info { margin-bottom: 15px; }
            .graph-container { width: 100%; height: 400px; }
            @media print {
              @page { size: landscape; margin: 0.5in; }
              body { margin: 0; }
              .no-print { display: none; }
              .graph-container { height: 500px; }
              .header { margin-bottom: 10px; }
              .info { margin-bottom: 10px; font-size: 12px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${title}</h1>
            <div class="info">
              <p><strong>Date Range:</strong> ${startDate && endDate ? `${format(new Date(startDate), 'MMM dd, yyyy')} - ${format(new Date(endDate), 'MMM dd, yyyy')}` : 'Not specified'}</p>
              <p><strong>Generated:</strong> ${format(new Date(), 'MMM dd, yyyy HH:mm')}</p>
              ${activeTab === 'alerts' ? `<p><strong>Silos:</strong> ${selectedAlertSilos.join(', ')}</p>` : ''}
            </div>
          </div>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    newWindow.document.close();
    newWindow.print();
  };

  const printGraph = () => {
    exportToPDF();
  };

  // Custom tooltip
  interface TooltipPayload {
    payload: TemperatureDataPoint;
    value: number;
  }
  
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`Time: ${label}`}</p>
          <p className="text-blue-600">
            {`Temperature: ${data.temperature.toFixed(1)}°C`}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <div className={`w-2 h-2 rounded-full ${
              data.status === 'critical' ? 'bg-red-500' : 
              data.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
            }`} />
            <span className="text-xs capitalize">{data.status}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`space-y-4 lg:space-y-6 px-2 sm:px-4 lg:px-6 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Enhanced Temperature Graphs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'silo' | 'alerts')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="silo">Silo Graph</TabsTrigger>
                <TabsTrigger value="alerts">Alert Silos Graph</TabsTrigger>
              </TabsList>

              <TabsContent value="silo" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                  {/* Silo Selection Dropdown */}
                  <div className="space-y-2">
                    <Label htmlFor="silo-select">Select Silo</Label>
                    <Select
                      value={selectedSilo ? selectedSilo.toString() : ""}
                      onValueChange={(value) => setSelectedSilo(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a silo..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-48">
                        {allSilos.map(silo => (
                          <SelectItem key={silo} value={silo.toString()}>
                            Silo {silo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Start Date & Time */}
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date & Time</Label>
                    <Input
                      id="start-date"
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      disabled={!selectedSilo}
                    />
                  </div>

                  {/* End Date & Time */}
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date & Time</Label>
                    <Input
                      id="end-date"
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      disabled={!selectedSilo || !startDate}
                      min={startDate}
                    />
                  </div>

                  {/* Generate Button */}
                  <div className="space-y-2">
                    <Label>&nbsp;</Label>
                    <Button
                      onClick={generateGraphData}
                      disabled={!canGenerate || isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Generate Graph
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="alerts" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                  {/* Alert Silos Selection with Search */}
                  <div className="space-y-2">
                    <Label>Alert Silos</Label>
                    <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
                      {/* Search Input */}
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search alarmed silos..."
                          value={alertSearchTerm}
                          onChange={(e) => setAlertSearchTerm(e.target.value)}
                          className="pl-10 h-8 text-sm"
                        />
                      </div>
                      
                      {/* Select All Controls */}
                      <div className="flex gap-2 mb-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleSelectAllAlerts}
                          className="text-xs h-7"
                        >
                          Select All Alarmed Silos ({filteredAlertSilos.length})
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleClearAllAlerts}
                          className="text-xs h-7"
                        >
                          Clear All
                        </Button>
                      </div>
                      
                      {/* Silo List */}
                      {filteredAlertSilos.length > 0 ? (
                        filteredAlertSilos.map(silo => (
                          <div key={silo.number} className="flex items-center space-x-2 mb-1">
                            <input
                              type="checkbox"
                              id={`alert-silo-${silo.number}`}
                              checked={selectedAlertSilos.includes(silo.number)}
                              onChange={() => handleAlertSiloToggle(silo.number)}
                              className="rounded"
                            />
                            <label htmlFor={`alert-silo-${silo.number}`} className="text-sm flex items-center gap-1">
                              Silo {silo.number}
                              <Badge 
                                variant={silo.status === 'Critical' ? 'destructive' : 'secondary'} 
                                className="text-xs bg-red-500 text-white"
                              >
                                ALARM
                              </Badge>
                            </label>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">
                          {alertSearchTerm ? 'No matching alarmed silos found' : 'No alarmed silos available'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Start Date & Time */}
                  <div className="space-y-2">
                    <Label htmlFor="alerts-start-date">Start Date & Time</Label>
                    <Input
                      id="alerts-start-date"
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      disabled={selectedAlertSilos.length === 0}
                    />
                  </div>

                  {/* End Date & Time */}
                  <div className="space-y-2">
                    <Label htmlFor="alerts-end-date">End Date & Time</Label>
                    <Input
                      id="alerts-end-date"
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      disabled={selectedAlertSilos.length === 0 || !startDate}
                      min={startDate}
                    />
                  </div>

                  {/* Generate Button */}
                  <div className="space-y-2">
                    <Label>&nbsp;</Label>
                    <Button
                      onClick={generateGraphData}
                      disabled={!canGenerate || isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Generate Graph
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Graph Display */}
            <AnimatePresence>
              {graphData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="mt-6"
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Temperature Trend
                        {activeTab === 'silo' && selectedSilo && (
                          <Badge variant="outline">Silo {selectedSilo}</Badge>
                        )}
                        {activeTab === 'alerts' && (
                          <Badge variant="outline">{selectedAlertSilos.length} Alert Silos</Badge>
                        )}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={exportToPDF}
                          className="flex items-center gap-1"
                        >
                          <Download className="h-4 w-4" />
                          PDF
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={printGraph}
                          className="flex items-center gap-1"
                        >
                          <Printer className="h-4 w-4" />
                          Print
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-2 sm:p-4 lg:p-6">
                      <div ref={printRef} className="w-full h-72 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px]">
                        {isLoading ? (
                          <div className="flex items-center justify-center h-full">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <RefreshCw className="h-8 w-8 text-blue-500" />
                            </motion.div>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={graphData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                              <XAxis 
                                dataKey="time" 
                                stroke="#64748b"
                                fontSize={10}
                                className="text-xs sm:text-sm"
                                tick={{ fontSize: 10 }}
                                interval="preserveStartEnd"
                              />
                              <YAxis 
                                stroke="#64748b"
                                fontSize={10}
                                className="text-xs sm:text-sm"
                                tick={{ fontSize: 10 }}
                                label={{ 
                                  value: 'Temperature (°C)', 
                                  angle: -90, 
                                  position: 'insideLeft',
                                  style: { textAnchor: 'middle', fontSize: '12px' }
                                }}
                              />
                              <Tooltip content={<CustomTooltip />} />
                              <Legend />
                              
                              {/* Temperature threshold lines */}
                              <ReferenceLine y={30} stroke="#f59e0b" strokeDasharray="5 5" label="Warning (30°C)" />
                              <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="5 5" label="Critical (40°C)" />
                              
                              {/* Render lines based on active tab */}
                              {activeTab === 'silo' ? (
                                <Line
                                  type="monotone"
                                  dataKey="temperature"
                                  stroke="#3b82f6"
                                  strokeWidth={3}
                                  name={selectedSilo ? `Silo ${selectedSilo}` : 'General'}
                                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                                />
                              ) : (
                                selectedAlertSilos.map((siloNum, index) => {
                                  const color = SILO_COLORS[index % SILO_COLORS.length];
                                  return (
                                    <Line
                                      key={siloNum}
                                      type="monotone"
                                      dataKey={`silo_${siloNum}`}
                                      stroke={color}
                                      strokeWidth={3}
                                      name={`Silo ${siloNum}`}
                                      dot={{ fill: color, strokeWidth: 2, r: 3 }}
                                      activeDot={{ r: 5, stroke: color, strokeWidth: 2 }}
                                    />
                                  );
                                })
                              )}
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                      
                      {/* Graph Info */}
                      {graphData.length > 0 && !isLoading && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
                            <div>
                              <span className="font-medium">Date Range:</span> {startDate && endDate ? `${format(new Date(startDate), 'MMM dd, yyyy')} - ${format(new Date(endDate), 'MMM dd, yyyy')}` : 'Not specified'}
                            </div>
                            <div>
                              <span className="font-medium">Data Points:</span> {graphData.length}
                            </div>
                            <div>
                              <span className="font-medium">Avg Temp:</span> {(graphData.reduce((sum, d) => sum + d.temperature, 0) / graphData.length).toFixed(1)}°C
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default EnhancedTemperatureGraphs;
