import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Scatter,
  ScatterChart,
  Cell,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts';
import { 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  Clock, 
  Filter,
  Download,
  RefreshCw,
  Settings,
  BarChart3,
  LineChart as LineChartIcon,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { getAlarmedSilos, generateTemperatureHistory } from '@/services/reportService';
import { format, subDays, subHours } from 'date-fns';

interface AlertEvent {
  id: string;
  siloId: number;
  timestamp: number;
  type: 'critical' | 'warning' | 'maintenance';
  temperature: number;
  message: string;
  duration: number;
  resolved: boolean;
}

interface AlertAnalyticsData {
  time: string;
  timestamp: number;
  temperature: number;
  alertCount: number;
  criticalCount: number;
  warningCount: number;
  maintenanceCount: number;
  alerts: AlertEvent[];
}

interface AlertAnalyticsSystemProps {
  className?: string;
}

const AlertAnalyticsSystem: React.FC<AlertAnalyticsSystemProps> = ({ className }) => {
  const [selectedSilos, setSelectedSilos] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [analyticsData, setAnalyticsData] = useState<AlertAnalyticsData[]>([]);
  const [alertEvents, setAlertEvents] = useState<AlertEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [alarmedSilos, setAlarmedSilos] = useState<Array<{ number: number; status: string }>>([]);
  const [activeTab, setActiveTab] = useState('correlation');
  const [alertFilter, setAlertFilter] = useState<'all' | 'critical' | 'warning' | 'maintenance'>('all');
  const [showPredictive, setShowPredictive] = useState(false);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        const alarmed = getAlarmedSilos();
        setAlarmedSilos(alarmed);
        
        // Initialize with first 3 alarmed silos
        const initialSilos = alarmed.slice(0, 3).map(s => s.number);
        setSelectedSilos(initialSilos);
        
        // Set default date range (last 3 days)
        const end = new Date();
        const start = subDays(end, 3);
        setEndDate(format(end, 'yyyy-MM-dd'));
        setStartDate(format(start, 'yyyy-MM-dd'));
        
        // Generate initial data
        await generateAnalyticsData(initialSilos, start, end);
      } catch (error) {
        console.error('Error initializing alert analytics:', error);
        setError('Failed to initialize alert analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Generate analytics data
  const generateAnalyticsData = useCallback(async (silos: number[], start: Date, end: Date) => {
    try {
      const dataPoints: AlertAnalyticsData[] = [];
      const allAlerts: AlertEvent[] = [];
      const numPoints = 72; // 3 days * 24 hours
      
      for (let i = 0; i < numPoints; i++) {
        const currentTime = new Date(start.getTime() + (i * (end.getTime() - start.getTime()) / (numPoints - 1)));
        
        // Generate temperature data
        let avgTemp = 0;
        let alertCount = 0;
        let criticalCount = 0;
        let warningCount = 0;
        let maintenanceCount = 0;
        const hourAlerts: AlertEvent[] = [];
        
        silos.forEach(siloNum => {
          const history = generateTemperatureHistory(siloNum, start, end);
          const historyIndex = Math.floor((i / numPoints) * history.length);
          const tempData = history[historyIndex] || history[0];
          avgTemp += tempData.maxTemp;
          
          // Generate alert events
          if (Math.random() < 0.15) { // 15% chance of alert
            const alertType = tempData.maxTemp > 40 ? 'critical' : 
                            tempData.maxTemp > 30 ? 'warning' : 'maintenance';
            
            const alert: AlertEvent = {
              id: `alert_${siloNum}_${i}`,
              siloId: siloNum,
              timestamp: currentTime.getTime(),
              type: alertType,
              temperature: tempData.maxTemp,
              message: `${alertType.charAt(0).toUpperCase() + alertType.slice(1)} temperature alert`,
              duration: Math.floor(Math.random() * 120) + 30, // 30-150 minutes
              resolved: Math.random() > 0.3 // 70% resolved
            };
            
            hourAlerts.push(alert);
            allAlerts.push(alert);
            alertCount++;
            
            if (alertType === 'critical') criticalCount++;
            else if (alertType === 'warning') warningCount++;
            else maintenanceCount++;
          }
        });
        
        avgTemp = avgTemp / silos.length;
        
        dataPoints.push({
          time: format(currentTime, 'MMM dd HH:mm'),
          timestamp: currentTime.getTime(),
          temperature: parseFloat(avgTemp.toFixed(1)),
          alertCount,
          criticalCount,
          warningCount,
          maintenanceCount,
          alerts: hourAlerts
        });
      }
      
      setAnalyticsData(dataPoints);
      setAlertEvents(allAlerts);
    } catch (error) {
      console.error('Error generating analytics data:', error);
      setError('Failed to generate analytics data');
    }
  }, []);

  // Generate data
  const generateData = useCallback(async () => {
    if (selectedSilos.length === 0 || !startDate || !endDate) return;

    setIsGenerating(true);
    setError('');
    
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Invalid date format');
      }

      await generateAnalyticsData(selectedSilos, start, end);
    } catch (error) {
      console.error('Error generating data:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate data');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedSilos, startDate, endDate, generateAnalyticsData]);

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    if (alertFilter === 'all') return alertEvents;
    return alertEvents.filter(alert => alert.type === alertFilter);
  }, [alertEvents, alertFilter]);

  // Custom tooltip for correlation chart
  const CorrelationTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{`Time: ${label}`}</p>
          <p className="text-sm text-blue-600">Temperature: {data.temperature}°C</p>
          <p className="text-sm text-red-600">Alerts: {data.alertCount}</p>
          {data.alerts.length > 0 && (
            <div className="mt-2 space-y-1">
              {data.alerts.map((alert: AlertEvent, idx: number) => (
                <div key={idx} className="text-xs">
                  <Badge variant={alert.type === 'critical' ? 'destructive' : 'secondary'}>
                    Silo {alert.siloId}: {alert.type}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Alert Analytics System</h2>
          <p className="text-gray-600">Correlate temperature alerts with historical patterns</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={generateData} disabled={isGenerating} size="sm" variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
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
            <CardTitle className="text-lg">Analytics Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <Label>Alarmed Silos</Label>
              <div className="mt-2 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {alarmedSilos.map(silo => (
                  <Button
                    key={silo.number}
                    size="sm"
                    variant={selectedSilos.includes(silo.number) ? "default" : "outline"}
                    onClick={() => {
                      if (selectedSilos.includes(silo.number)) {
                        setSelectedSilos(prev => prev.filter(s => s !== silo.number));
                      } else {
                        setSelectedSilos(prev => [...prev, silo.number]);
                      }
                    }}
                    className="text-xs"
                  >
                    {silo.number}
                  </Button>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="predictive"
                  checked={showPredictive}
                  onCheckedChange={setShowPredictive}
                />
                <Label htmlFor="predictive">Predictive Indicators</Label>
              </div>
              
              <div>
                <Label>Alert Filter</Label>
                <Select value={alertFilter} onValueChange={(v: any) => setAlertFilter(v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Alerts</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={generateData}
              disabled={selectedSilos.length === 0 || !startDate || !endDate || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating Analytics...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4 mr-2" />
                  Generate Alert Analytics
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Analytics Tabs */}
      {analyticsData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="correlation">Temperature-Alert Correlation</TabsTrigger>
              <TabsTrigger value="frequency">Alert Frequency</TabsTrigger>
              <TabsTrigger value="timeline">Alert Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="correlation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Temperature vs Alert Correlation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={analyticsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis yAxisId="temp" orientation="left" />
                        <YAxis yAxisId="alerts" orientation="right" />
                        <Tooltip content={<CorrelationTooltip />} />
                        
                        <Area
                          yAxisId="temp"
                          type="monotone"
                          dataKey="temperature"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.3}
                          name="Temperature (°C)"
                        />
                        
                        <Bar
                          yAxisId="alerts"
                          dataKey="alertCount"
                          fill="#ef4444"
                          name="Alert Count"
                          opacity={0.7}
                        />
                        
                        <ReferenceLine yAxisId="temp" y={30} stroke="#f59e0b" strokeDasharray="5 5" />
                        <ReferenceLine yAxisId="temp" y={40} stroke="#ef4444" strokeDasharray="5 5" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="frequency" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Alert Frequency Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        
                        <Bar dataKey="criticalCount" stackId="a" fill="#ef4444" name="Critical" />
                        <Bar dataKey="warningCount" stackId="a" fill="#f59e0b" name="Warning" />
                        <Bar dataKey="maintenanceCount" stackId="a" fill="#6b7280" name="Maintenance" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Alert Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredAlerts.map(alert => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            alert.type === 'critical' ? 'bg-red-500' :
                            alert.type === 'warning' ? 'bg-yellow-500' : 'bg-gray-500'
                          }`} />
                          <div>
                            <p className="font-medium">Silo {alert.siloId}</p>
                            <p className="text-sm text-gray-600">{alert.message}</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(alert.timestamp), 'MMM dd, HH:mm')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <Badge variant={alert.type === 'critical' ? 'destructive' : 'secondary'}>
                            {alert.type}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">{alert.temperature}°C</p>
                          <p className="text-xs text-gray-500">{alert.duration}min</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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

      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center h-64"
        >
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Loading alert analytics...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AlertAnalyticsSystem;
