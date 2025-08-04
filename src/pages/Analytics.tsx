import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Thermometer, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface AnalyticsData {
  totalTests: number;
  successRate: number;
  averageTemperature: number;
  temperatureRange: { min: number; max: number };
  totalSilos: number;
  lastTestTime: Date;
  performanceMetrics: {
    responseTime: number;
    throughput: number;
    errorRate: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'test' | 'alert' | 'maintenance';
    message: string;
    timestamp: Date;
    status: 'success' | 'warning' | 'error';
  }>;
}

const Analytics = () => {
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [selectedMetric, setSelectedMetric] = useState<string>('temperature');

  // Mock analytics data
  const analyticsData: AnalyticsData = {
    totalTests: 156,
    successRate: 94.2,
    averageTemperature: 32.8,
    temperatureRange: { min: 20.1, max: 49.8 },
    totalSilos: 150,
    lastTestTime: new Date(),
    performanceMetrics: {
      responseTime: 2.3,
      throughput: 45.2,
      errorRate: 2.1
    },
    recentActivity: [
      {
        id: '1',
        type: 'test',
        message: 'Auto test completed - 150 silos tested',
        timestamp: new Date('2024-08-04T12:30:00'),
        status: 'success'
      },
      {
        id: '2',
        type: 'alert',
        message: 'High temperature detected in silo 112',
        timestamp: new Date('2024-08-04T12:25:00'),
        status: 'warning'
      },
      {
        id: '3',
        type: 'test',
        message: 'Manual test failed - connection timeout',
        timestamp: new Date('2024-08-04T12:20:00'),
        status: 'error'
      },
      {
        id: '4',
        type: 'maintenance',
        message: 'System maintenance completed',
        timestamp: new Date('2024-08-04T12:15:00'),
        status: 'success'
      }
    ]
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Performance metrics and system analytics</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Time Range</label>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger>
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Metric</label>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger>
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="temperature">Temperature</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="tests">Test Results</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button variant="outline">
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalTests}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Temperature</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.averageTemperature}°C</div>
            <p className="text-xs text-muted-foreground">
              Range: {analyticsData.temperatureRange.min}°C - {analyticsData.temperatureRange.max}°C
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.performanceMetrics.responseTime}s</div>
            <p className="text-xs text-muted-foreground">
              -0.3s from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Throughput</span>
                <span className="text-sm font-bold">{analyticsData.performanceMetrics.throughput} tests/min</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(analyticsData.performanceMetrics.throughput / 60) * 100}%` }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Error Rate</span>
                <span className="text-sm font-bold">{analyticsData.performanceMetrics.errorRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: `${analyticsData.performanceMetrics.errorRate}%` }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Success Rate</span>
                <span className="text-sm font-bold">{analyticsData.successRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${analyticsData.successRate}%` }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Temperature Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Normal Range (20-35°C)</span>
                <Badge className="bg-green-100 text-green-800">65%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Warning Range (35-40°C)</span>
                <Badge className="bg-yellow-100 text-yellow-800">25%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Critical Range (&gt;40°C)</span>
                <Badge className="bg-red-100 text-red-800">10%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(activity.status)}
                  <div>
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-gray-500">
                      {activity.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(activity.status)}>
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics; 