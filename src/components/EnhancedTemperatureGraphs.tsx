import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Calendar, Download, Printer, RefreshCw, TrendingUp, AlertTriangle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelectDropdown } from './MultiSelectDropdown';
import AdvancedSiloVisualization from './AdvancedSiloVisualization';
import AlertAnalyticsSystem from './AlertAnalyticsSystem';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAllSiloNumbers, getAlarmedSilos, generateTemperatureHistory } from '@/services/reportService';
import { format, differenceInDays, differenceInHours } from 'date-fns';

interface TemperatureDataPoint {
  time: string;
  temperature: number;
  status: 'normal' | 'warning' | 'critical';
}

interface EnhancedTemperatureGraphsProps {
  className?: string;
}

const EnhancedTemperatureGraphs: React.FC<EnhancedTemperatureGraphsProps> = ({ className }) => {
  // State management
  const [activeTab, setActiveTab] = useState<'silo' | 'alerts' | 'advanced' | 'analytics'>('silo');
  const [selectedSilo, setSelectedSilo] = useState<number | null>(null);
  const [selectedAlertSilos, setSelectedAlertSilos] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [graphData, setGraphData] = useState<TemperatureDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [canGenerate, setCanGenerate] = useState(false);
  const [hasGeneralGraph, setHasGeneralGraph] = useState(false);
  const [siloSearchTerm, setSiloSearchTerm] = useState('');
  const [alertSearchTerm, setAlertSearchTerm] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  // Get available silos
  const allSilos = getAllSiloNumbers();
  const alertSilos = getAlarmedSilos();
  
  // Filter silos based on search terms
  const filteredSilos = allSilos.filter(silo => 
    silo.toString().includes(siloSearchTerm)
  );
  
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
      
      // Determine if it's a single day or multiple days
      const daysDiff = differenceInDays(end, start);
      const hoursDiff = differenceInHours(end, start);
      const isSingleDay = daysDiff === 0;
      
      // Set data points and time format based on date range
      let dataPoints: number;
      let timeFormat: string;
      
      if (isSingleDay) {
        // Single day: show hours, max 24 data points (hourly)
        dataPoints = Math.min(hoursDiff + 1, 24);
        timeFormat = 'HH:mm';
      } else {
        // Multiple days: show days, one point per day
        dataPoints = daysDiff + 1;
        timeFormat = 'MMM dd';
      }

      for (let i = 0; i < dataPoints; i++) {
        const currentTime = new Date(start.getTime() + (i * (end.getTime() - start.getTime()) / (dataPoints - 1)));
        
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
          // Multiple silos - average temperature
          let totalTemp = 0;
          let maxStatus: 'normal' | 'warning' | 'critical' = 'normal';
          
          silosToProcess.forEach(siloNum => {
            const history = generateTemperatureHistory(siloNum, start, end);
            const dataPoint = history[Math.floor((i / dataPoints) * history.length)] || history[0];
            totalTemp += dataPoint.maxTemp;
            
            const status = dataPoint.maxTemp > 40 ? 'critical' : dataPoint.maxTemp >= 30 ? 'warning' : 'normal';
            if (status === 'critical' || (status === 'warning' && maxStatus === 'normal')) {
              maxStatus = status;
            }
          });
          
          combinedData.push({
            time: format(currentTime, timeFormat),
            temperature: totalTemp / silosToProcess.length,
            status: maxStatus
          });
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
              body { margin: 0; }
              .no-print { display: none; }
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
    <div className={`space-y-6 ${className}`}>
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
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'silo' | 'alerts' | 'advanced' | 'analytics')}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="silo">Silo Graph</TabsTrigger>
                <TabsTrigger value="alerts">Alert Silos Graph</TabsTrigger>
                <TabsTrigger value="advanced">Advanced Visualization</TabsTrigger>
                <TabsTrigger value="analytics">Alert Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="silo" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Silo Selection with Search */}
                  <div className="space-y-2">
                    <Label htmlFor="silo-select">Select Silo</Label>
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search silo number..."
                          value={siloSearchTerm}
                          onChange={(e) => setSiloSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      {siloSearchTerm && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {filteredSilos.length > 0 ? (
                            filteredSilos.map(silo => (
                              <div
                                key={silo}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                onClick={() => {
                                  setSelectedSilo(silo);
                                  setSiloSearchTerm(`Silo ${silo}`);
                                }}
                              >
                                Silo {silo}
                              </div>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-500">
                              No silos found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {selectedSilo && (
                      <div className="text-sm text-green-600">
                        Selected: Silo {selectedSilo}
                      </div>
                    )}
                  </div>

                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      disabled={!selectedSilo}
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      disabled={!selectedSilo || !startDate}
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label htmlFor="alerts-start-date">Start Date</Label>
                    <Input
                      id="alerts-start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      disabled={selectedAlertSilos.length === 0}
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <Label htmlFor="alerts-end-date">End Date</Label>
                    <Input
                      id="alerts-end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      disabled={selectedAlertSilos.length === 0 || !startDate}
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

              <TabsContent value="advanced" className="space-y-4">
                <AdvancedSiloVisualization className="mt-6" />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <AlertAnalyticsSystem className="mt-6" />
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
                    <CardContent>
                      <div ref={printRef} className="w-full h-80">
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
                            <AreaChart data={graphData}>
                              <defs>
                                <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                              <XAxis 
                                dataKey="time" 
                                stroke="#64748b"
                                fontSize={12}
                              />
                              <YAxis 
                                stroke="#64748b"
                                fontSize={12}
                                label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
                              />
                              <Tooltip content={<CustomTooltip />} />
                              
                              {/* Temperature threshold lines */}
                              <ReferenceLine y={30} stroke="#f59e0b" strokeDasharray="5 5" label="Warning (30°C)" />
                              <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="5 5" label="Critical (40°C)" />
                              
                              <Area
                                type="monotone"
                                dataKey="temperature"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fill="url(#temperatureGradient)"
                                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                      
                      {/* Graph Info */}
                      {graphData.length > 0 && !isLoading && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
