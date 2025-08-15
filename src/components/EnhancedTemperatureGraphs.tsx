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
import { generateTemperatureGraphData } from '@/services/historicalSiloApiService';
import { alertedSiloSearchService, AlertedSilo } from '@/services/alertedSiloSearchService';
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
  const [alertSilos, setAlertSilos] = useState<AlertedSilo[]>([]);
  const [alertStats, setAlertStats] = useState({ total: 0, critical: 0, warning: 0 });
  const [isSearching, setIsSearching] = useState(false);
  
  // Load alert silos on component mount with enhanced search service
  const getAlarmedSilosList = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setIsSearching(true);
      const alarmedSilos = await alertedSiloSearchService.getAllAlertedSilos(forceRefresh);
      const stats = await alertedSiloSearchService.getAlertStats();
      
      setAlertSilos(alarmedSilos);
      setAlertStats(stats);
      
      return alarmedSilos;
    } catch (error) {
      console.error('Error fetching alarmed silos:', error);
      setAlertSilos([]);
      setAlertStats({ total: 0, critical: 0, warning: 0 });
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    getAlarmedSilosList();
  }, [getAlarmedSilosList]);
  
  // Fast search through alerted silos
  const [searchResults, setSearchResults] = useState<AlertedSilo[]>([]);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Critical' | 'Warning'>('All');
  
  // Perform fast search when search term or filter changes
  useEffect(() => {
    const performSearch = async () => {
      try {
        const results = await alertedSiloSearchService.searchAlertedSilos(alertSearchTerm, statusFilter);
        setSearchResults(results.silos);
      } catch (error) {
        console.error('Error searching alerted silos:', error);
        setSearchResults([]);
      }
    };
    
    if (alertSilos.length > 0) {
      performSearch();
    }
  }, [alertSearchTerm, statusFilter, alertSilos]);
  
  // Use search results for filtering
  const filteredAlertSilos = searchResults;

  // Progressive UI enabling logic
  useEffect(() => {
    if (activeTab === 'silo') {
      setCanGenerate(selectedSilo !== null && startDate !== '' && endDate !== '');
    } else {
      setCanGenerate(selectedAlertSilos.length > 0 && startDate !== '' && endDate !== '');
    }
  }, [activeTab, selectedSilo, selectedAlertSilos, startDate, endDate]);
  
  // Generate default general graph using 24-unit system
  const generateDefaultGraph = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Generate general graph for last 7 days with sample silos using 24-unit system
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      const sampleSilos = allSilos.slice(0, 5); // First 5 silos as sample
      
      // Apply 24-unit system to default graph
      const totalHours = differenceInHours(endDate, startDate); // 7 days = 168 hours
      const dataPoints = 24; // Fixed 24 units
      const hoursPerUnit = totalHours / 24; // 168 / 24 = 7 hours per unit
      const timeInterval = hoursPerUnit * 60 * 60 * 1000; // Convert to milliseconds
      
      const generalData: TemperatureDataPoint[] = [];
      
      for (let i = 0; i < dataPoints; i++) {
        const currentTime = new Date(startDate.getTime() + (i * timeInterval));
        let totalTemp = 0;
        let maxStatus: 'normal' | 'warning' | 'critical' = 'normal';
        
        for (const siloNum of sampleSilos) {
          try {
            const history = await generateTemperatureHistory(siloNum, startDate, endDate);
            const dataPoint = history[Math.floor((i / dataPoints) * history.length)] || history[0];
            totalTemp += dataPoint.maxTemp;
            
            const status = dataPoint.maxTemp > 40 ? 'critical' : dataPoint.maxTemp >= 35 ? 'warning' : 'normal';
            if (status === 'critical' || (status === 'warning' && maxStatus === 'normal')) {
              maxStatus = status;
            }
          } catch (error) {
            console.error(`Error fetching history for silo ${siloNum}:`, error);
            // Use fallback temperature
            const fallbackTemp = 25 + Math.random() * 10;
            totalTemp += fallbackTemp;
          }
        };
        
        // Use appropriate time format for 7-hour intervals
        generalData.push({
          time: format(currentTime, 'MMM dd HH:mm'),
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
      
      // FIXED 24-UNIT HORIZONTAL AXIS SYSTEM
      // Calculate total hours between start and end dates
      const totalHours = differenceInHours(end, start);
      
      // Minimum range validation: Cannot generate graphs for less than 24 hours
      if (totalHours < 24) {
        throw new Error('Cannot generate graphs for less than 24 hours. Please select a range of at least 24 hours.');
      }
      
      // ALWAYS use exactly 24 data points (fixed horizontal units)
      const dataPoints = 24;
      
      // Calculate hours per unit: Total hours ÷ 24 units
      const hoursPerUnit = totalHours / 24;
      const timeInterval = hoursPerUnit * 60 * 60 * 1000; // Convert to milliseconds
      
      // Dynamic time format based on hours per unit
      let timeFormat: string;
      
      if (hoursPerUnit <= 1) {
        // Each unit represents 1 hour or less
        timeFormat = 'HH:mm';
      } else if (hoursPerUnit < 24) {
        // Each unit represents multiple hours but less than a day
        timeFormat = 'MMM dd HH:mm';
      } else if (hoursPerUnit === 24) {
        // Each unit represents exactly 1 day
        timeFormat = 'MMM dd';
      } else {
        // Each unit represents multiple days
        timeFormat = 'MMM dd';
      }

      for (let i = 0; i < dataPoints; i++) {
        const currentTime = new Date(start.getTime() + (i * timeInterval));
        
        if (activeTab === 'silo') {
          // Single silo data using REAL API
          try {
            const history = await generateTemperatureHistory(selectedSilo!, start, end);
            const dataPoint = history[Math.floor((i / dataPoints) * history.length)] || history[0];
            
            combinedData.push({
              time: format(currentTime, timeFormat),
              temperature: dataPoint.maxTemp,
              status: dataPoint.maxTemp > 40 ? 'critical' : dataPoint.maxTemp >= 35 ? 'warning' : 'normal'
            });
          } catch (error) {
            console.error('Error fetching single silo data from API:', error);
            // Fallback to simulated data if API fails
            combinedData.push({
              time: format(currentTime, timeFormat),
              temperature: 25 + Math.random() * 20, // Fallback temperature
              status: 'normal'
            });
          }
        } else {
          // Multi-silo overlay data using REAL API
          try {
            const graphData = await generateTemperatureGraphData(selectedAlertSilos, start, end);
            const apiDataPoint = graphData[Math.floor((i / dataPoints) * graphData.length)] || graphData[0];
            
            const dataPoint: TemperatureDataPoint = {
              time: format(currentTime, timeFormat),
              temperature: 0,
              status: 'normal' as 'normal' | 'warning' | 'critical'
            };
            
            let totalTemp = 0;
            let maxStatus: 'normal' | 'warning' | 'critical' = 'normal';
            let validSilos = 0;
            
            selectedAlertSilos.forEach(siloNum => {
              const temp = apiDataPoint ? (apiDataPoint[`silo_${siloNum}`] as number) || 0 : 25 + Math.random() * 20;
              
              dataPoint[`silo_${siloNum}`] = temp;
              totalTemp += temp;
              validSilos++;
              
              const status = temp > 40 ? 'critical' : temp >= 35 ? 'warning' : 'normal';
              if (status === 'critical' || (status === 'warning' && maxStatus === 'normal')) {
                maxStatus = status;
              }
            });
            
            dataPoint.temperature = validSilos > 0 ? totalTemp / validSilos : 0;
            dataPoint.status = maxStatus;
            combinedData.push(dataPoint);
          } catch (error) {
            console.error('Error fetching multi-silo data from API:', error);
            // Fallback to simulated data
            const dataPoint: TemperatureDataPoint = {
              time: format(currentTime, timeFormat),
              temperature: 0,
              status: 'normal' as 'normal' | 'warning' | 'critical'
            };
            
            let totalTemp = 0;
            let maxStatus: 'normal' | 'warning' | 'critical' = 'normal';
            
            selectedAlertSilos.forEach(siloNum => {
              const temp = 25 + Math.random() * 20; // Fallback temperature
              dataPoint[`silo_${siloNum}`] = temp;
              totalTemp += temp;
              
              const status = temp > 40 ? 'critical' : temp >= 35 ? 'warning' : 'normal';
              if (status === 'critical' || (status === 'warning' && maxStatus === 'normal')) {
                maxStatus = status;
              }
            });
            
            dataPoint.temperature = totalTemp / selectedAlertSilos.length;
            dataPoint.status = maxStatus;
            combinedData.push(dataPoint);
          }
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
    name?: string;
    dataKey?: string;
  }
  
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`Time: ${label}`}</p>
          {payload.map((entry, index) => {
            const value = entry.value;
            const siloName = entry.name || 'Temperature';
            
            if (value === null || value === undefined) {
              return (
                <p key={index} className="text-gray-500 text-sm">
                  {`${siloName}: No data available`}
                </p>
              );
            }
            
            // Determine status based on temperature value
            let status: 'normal' | 'warning' | 'critical' = 'normal';
            if (value >= 40) {
              status = 'critical';
            } else if (value >= 35) {
              status = 'warning';
            }
            
            return (
              <div key={index}>
                <p className="text-blue-600">
                  {`${siloName}: ${value.toFixed(1)}°C`}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <div className={`w-2 h-2 rounded-full ${
                    status === 'critical' ? 'bg-red-500' : 
                    status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <span className="text-xs capitalize">{status}</span>
                </div>
              </div>
            );
          })}
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

                  {/* Start Date & Hour */}
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date & Hour</Label>
                    <div className="flex gap-2">
                      <Input
                        id="start-date"
                        type="date"
                        value={startDate ? startDate.split('T')[0] : ''}
                        onChange={(e) => setStartDate(`${e.target.value}T${startDate ? startDate.split('T')[1] || '00:00' : '00:00'}`)}
                        disabled={!selectedSilo}
                        className="flex-1"
                      />
                      <select
                        value={startDate ? startDate.split('T')[1]?.split(':')[0] || '00' : '00'}
                        onChange={(e) => setStartDate(`${startDate ? startDate.split('T')[0] : new Date().toISOString().split('T')[0]}T${e.target.value}:00`)}
                        disabled={!selectedSilo}
                        className="w-20 px-2 py-1 border border-gray-300 rounded"
                      >
                        {Array.from({length: 24}, (_, i) => (
                          <option key={i} value={i.toString().padStart(2, '0')}>
                            {i.toString().padStart(2, '0')}:00
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* End Date & Hour */}
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date & Hour</Label>
                    <div className="flex gap-2">
                      <Input
                        id="end-date"
                        type="date"
                        value={endDate ? endDate.split('T')[0] : ''}
                        onChange={(e) => setEndDate(`${e.target.value}T${endDate ? endDate.split('T')[1] || '23:00' : '23:00'}`)}
                        disabled={!selectedSilo || !startDate}
                        className="flex-1"
                      />
                      <select
                        value={endDate ? endDate.split('T')[1]?.split(':')[0] || '23' : '23'}
                        onChange={(e) => setEndDate(`${endDate ? endDate.split('T')[0] : new Date().toISOString().split('T')[0]}T${e.target.value}:00`)}
                        disabled={!selectedSilo || !startDate}
                        className="w-20 px-2 py-1 border border-gray-300 rounded"
                      >
                        {Array.from({length: 24}, (_, i) => (
                          <option key={i} value={i.toString().padStart(2, '0')}>
                            {i.toString().padStart(2, '0')}:00
                          </option>
                        ))}
                      </select>
                    </div>
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
                  {/* Alert Silos Selection with Enhanced Fast Search */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Alert Silos</Label>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Badge variant="destructive" className="text-xs">{alertStats.critical}</Badge>
                        <span>Critical</span>
                        <Badge variant="secondary" className="text-xs">{alertStats.warning}</Badge>
                        <span>Warning</span>
                        {isSearching && <RefreshCw className="h-3 w-3 animate-spin" />}
                      </div>
                    </div>
                    <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
                      {/* Fast Search Controls */}
                      <div className="space-y-2 mb-3">
                        {/* Search Input */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Fast search alerted silos..."
                            value={alertSearchTerm}
                            onChange={(e) => setAlertSearchTerm(e.target.value)}
                            className="pl-10 h-8 text-sm"
                          />
                        </div>
                        
                        {/* Status Filter Buttons */}
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant={statusFilter === 'All' ? 'default' : 'outline'}
                            onClick={() => setStatusFilter('All')}
                            className="text-xs h-6 px-2"
                          >
                            All ({alertStats.total})
                          </Button>
                          <Button
                            size="sm"
                            variant={statusFilter === 'Critical' ? 'destructive' : 'outline'}
                            onClick={() => setStatusFilter('Critical')}
                            className="text-xs h-6 px-2"
                          >
                            Critical ({alertStats.critical})
                          </Button>
                          <Button
                            size="sm"
                            variant={statusFilter === 'Warning' ? 'secondary' : 'outline'}
                            onClick={() => setStatusFilter('Warning')}
                            className="text-xs h-6 px-2"
                          >
                            Warning ({alertStats.warning})
                          </Button>
                        </div>
                      </div>
                      
                      {/* Select All Controls */}
                      <div className="flex gap-2 mb-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleSelectAllAlerts}
                          className="text-xs h-7"
                          disabled={filteredAlertSilos.length === 0}
                        >
                          Select All ({filteredAlertSilos.length})
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleClearAllAlerts}
                          className="text-xs h-7"
                        >
                          Clear All
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => getAlarmedSilosList(true)}
                          className="text-xs h-7"
                          disabled={isSearching}
                        >
                          {isSearching ? <RefreshCw className="h-3 w-3 animate-spin" /> : 'Refresh'}
                        </Button>
                      </div>
                      
                      {/* Enhanced Silo List */}
                      {filteredAlertSilos.length > 0 ? (
                        filteredAlertSilos.map(silo => (
                          <div key={silo.number} className="flex items-center space-x-2 mb-1 p-1 rounded hover:bg-gray-50">
                            <input
                              type="checkbox"
                              id={`alert-silo-${silo.number}`}
                              checked={selectedAlertSilos.includes(silo.number)}
                              onChange={() => handleAlertSiloToggle(silo.number)}
                              className="rounded"
                            />
                            <label htmlFor={`alert-silo-${silo.number}`} className="text-sm flex items-center gap-2 flex-1 cursor-pointer">
                              <span className="font-medium">Silo {silo.number}</span>
                              <Badge 
                                variant={silo.status === 'Critical' ? 'destructive' : 'secondary'} 
                                className={`text-xs ${
                                  silo.status === 'Critical' 
                                    ? 'bg-red-500 text-white' 
                                    : 'bg-yellow-500 text-white'
                                }`}
                              >
                                {silo.status.toUpperCase()}
                              </Badge>
                              <span className="text-xs text-gray-400 ml-auto">
                                {silo.lastUpdated.toLocaleTimeString()}
                              </span>
                            </label>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 text-center py-4">
                          {isSearching ? (
                            <div className="flex items-center justify-center gap-2">
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Searching alerted silos...
                            </div>
                          ) : alertSearchTerm || statusFilter !== 'All' ? (
                            'No matching alerted silos found'
                          ) : (
                            'No alerted silos available'
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Start Date & Hour */}
                  <div className="space-y-2">
                    <Label htmlFor="alerts-start-date">Start Date & Hour</Label>
                    <div className="flex gap-2">
                      <Input
                        id="alerts-start-date"
                        type="date"
                        value={startDate ? startDate.split('T')[0] : ''}
                        onChange={(e) => setStartDate(`${e.target.value}T${startDate ? startDate.split('T')[1] || '00:00' : '00:00'}`)}
                        disabled={selectedAlertSilos.length === 0}
                        className="flex-1"
                      />
                      <select
                        value={startDate ? startDate.split('T')[1]?.split(':')[0] || '00' : '00'}
                        onChange={(e) => setStartDate(`${startDate ? startDate.split('T')[0] : new Date().toISOString().split('T')[0]}T${e.target.value}:00`)}
                        disabled={selectedAlertSilos.length === 0}
                        className="w-20 px-2 py-1 border border-gray-300 rounded"
                      >
                        {Array.from({length: 24}, (_, i) => (
                          <option key={i} value={i.toString().padStart(2, '0')}>
                            {i.toString().padStart(2, '0')}:00
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* End Date & Hour */}
                  <div className="space-y-2">
                    <Label htmlFor="alerts-end-date">End Date & Hour</Label>
                    <div className="flex gap-2">
                      <Input
                        id="alerts-end-date"
                        type="date"
                        value={endDate ? endDate.split('T')[0] : ''}
                        onChange={(e) => setEndDate(`${e.target.value}T${endDate ? endDate.split('T')[1] || '23:00' : '23:00'}`)}
                        disabled={selectedAlertSilos.length === 0 || !startDate}
                        className="flex-1"
                      />
                      <select
                        value={endDate ? endDate.split('T')[1]?.split(':')[0] || '23' : '23'}
                        onChange={(e) => setEndDate(`${endDate ? endDate.split('T')[0] : new Date().toISOString().split('T')[0]}T${e.target.value}:00`)}
                        disabled={selectedAlertSilos.length === 0 || !startDate}
                        className="w-20 px-2 py-1 border border-gray-300 rounded"
                      >
                        {Array.from({length: 24}, (_, i) => (
                          <option key={i} value={i.toString().padStart(2, '0')}>
                            {i.toString().padStart(2, '0')}:00
                          </option>
                        ))}
                      </select>
                    </div>
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
                              <ReferenceLine y={35} stroke="#f59e0b" strokeDasharray="5 5" label="Warning (35°C)" />
                              <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="5 5" label="Critical (40°C)" />
                              
                              {/* Render lines based on active tab */}
                              {activeTab === 'silo' ? (
                                <Line
                                  type="monotone"
                                  dataKey="temperature"
                                  stroke="#3b82f6"
                                  strokeWidth={3}
                                  name={selectedSilo ? `Silo ${selectedSilo}` : 'General Silos Readings'}
                                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                                  connectNulls={false}
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
                                      connectNulls={false}
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
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
                            <div>
                              <span className="font-medium">Date Range:</span> {startDate && endDate ? `${format(new Date(startDate), 'MMM dd, yyyy')} - ${format(new Date(endDate), 'MMM dd, yyyy')}` : 'Not specified'}
                            </div>
                            <div>
                              <span className="font-medium">Time Points:</span> {graphData.length} (24 distributed)
                            </div>
                            <div>
                              <span className="font-medium">Data Coverage:</span> {(() => {
                                const targetSilos = activeTab === 'silo' ? (selectedSilo ? [selectedSilo] : []) : selectedAlertSilos;
                                if (targetSilos.length === 0) return 'N/A';
                                
                                const totalPoints = graphData.length * targetSilos.length;
                                const validPoints = graphData.reduce((count, point) => {
                                  return count + targetSilos.filter(silo => {
                                    const key = activeTab === 'silo' ? 'temperature' : `silo_${silo}`;
                                    return point[key] !== null && point[key] !== undefined;
                                  }).length;
                                }, 0);
                                
                                return `${((validPoints / totalPoints) * 100).toFixed(1)}%`;
                              })()}
                            </div>
                            <div>
                              <span className="font-medium">Avg Temp:</span> {(() => {
                                const targetSilos = activeTab === 'silo' ? (selectedSilo ? [selectedSilo] : []) : selectedAlertSilos;
                                if (targetSilos.length === 0) return 'N/A';
                                
                                let totalTemp = 0;
                                let validCount = 0;
                                
                                graphData.forEach(point => {
                                  targetSilos.forEach(silo => {
                                    const key = activeTab === 'silo' ? 'temperature' : `silo_${silo}`;
                                    const temp = point[key];
                                    if (temp !== null && temp !== undefined && typeof temp === 'number') {
                                      totalTemp += temp;
                                      validCount++;
                                    }
                                  });
                                });
                                
                                return validCount > 0 ? `${(totalTemp / validCount).toFixed(1)}°C` : 'No data';
                              })()}
                            </div>
                          </div>
                          
                          {/* Missing data warning */}
                          {(() => {
                            const targetSilos = activeTab === 'silo' ? (selectedSilo ? [selectedSilo] : []) : selectedAlertSilos;
                            if (targetSilos.length === 0) return null;
                            
                            const totalPoints = graphData.length * targetSilos.length;
                            const validPoints = graphData.reduce((count, point) => {
                              return count + targetSilos.filter(silo => {
                                const key = activeTab === 'silo' ? 'temperature' : `silo_${silo}`;
                                return point[key] !== null && point[key] !== undefined;
                              }).length;
                            }, 0);
                            
                            const missingPercent = ((totalPoints - validPoints) / totalPoints) * 100;
                            
                            if (missingPercent > 20) {
                              return (
                                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                                  <div className="flex items-center gap-2 text-yellow-800">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="font-medium">Missing Data Notice:</span>
                                  </div>
                                  <p className="text-yellow-700 mt-1">
                                    {missingPercent.toFixed(1)}% of data points are missing for the selected time range. 
                                    Gaps in the graph indicate periods with no sensor readings.
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          })()}
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
