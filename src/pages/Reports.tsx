import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useTheme } from '../contexts/ThemeContext';

interface TestReport {
  id: string;
  type: 'manual' | 'auto';
  startTime: Date;
  endTime: Date;
  duration: number;
  silosTested: number;
  status: 'completed' | 'failed' | 'in-progress';
  temperatureRange: { min: number; max: number };
  notes?: string;
}

const Reports = () => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { isDark } = useTheme();

  // Mock data for reports
  const mockReports: TestReport[] = [
    {
      id: 'RPT-001',
      type: 'auto',
      startTime: new Date('2024-08-04T10:00:00'),
      endTime: new Date('2024-08-04T10:05:30'),
      duration: 330,
      silosTested: 150,
      status: 'completed',
      temperatureRange: { min: 22.5, max: 45.2 },
      notes: 'All silos tested successfully'
    },
    {
      id: 'RPT-002',
      type: 'manual',
      startTime: new Date('2024-08-04T09:30:00'),
      endTime: new Date('2024-08-04T09:45:00'),
      duration: 900,
      silosTested: 25,
      status: 'completed',
      temperatureRange: { min: 28.1, max: 38.9 },
      notes: 'Manual inspection of critical silos'
    },
    {
      id: 'RPT-003',
      type: 'auto',
      startTime: new Date('2024-08-04T08:00:00'),
      endTime: new Date('2024-08-04T08:02:15'),
      duration: 135,
      silosTested: 150,
      status: 'failed',
      temperatureRange: { min: 20.0, max: 50.0 },
      notes: 'Connection timeout during testing'
    },
    {
      id: 'RPT-004',
      type: 'manual',
      startTime: new Date('2024-08-03T16:00:00'),
      endTime: new Date('2024-08-03T16:20:00'),
      duration: 1200,
      silosTested: 50,
      status: 'completed',
      temperatureRange: { min: 25.3, max: 42.1 },
      notes: 'Routine maintenance check'
    },
    {
      id: 'RPT-005',
      type: 'auto',
      startTime: new Date('2024-08-03T14:00:00'),
      endTime: new Date('2024-08-03T14:03:45'),
      duration: 225,
      silosTested: 150,
      status: 'completed',
      temperatureRange: { min: 23.8, max: 39.7 },
      notes: 'Scheduled automated test'
    }
  ];

  const filteredReports = mockReports.filter(report => {
    const matchesType = filterType === 'all' || report.type === filterType;
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Test Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View and analyze test history and performance metrics
            </p>
          </div>
          <Button className="w-full sm:w-auto">
            Export All Reports
          </Button>
        </div>

        {/* Filters */}
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader>
            <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Test Type
                </label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Search
                </label>
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Date Range
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Last 7 days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 days</SelectItem>
                    <SelectItem value="month">Last 30 days</SelectItem>
                    <SelectItem value="quarter">Last 3 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredReports.map((report) => (
            <Card key={report.id} className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {report.id}
                  </CardTitle>
                  <Badge className={getStatusColor(report.status)}>
                    {report.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Type:</span>
                    <span className="ml-2 font-medium capitalize">{report.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                    <span className="ml-2 font-medium">{formatDuration(report.duration)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Silos:</span>
                    <span className="ml-2 font-medium">{report.silosTested}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Start:</span>
                    <span className="ml-2 font-medium">{formatDate(report.startTime)}</span>
                  </div>
                </div>
                
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Temperature Range:</span>
                  <span className="ml-2 font-medium">
                    {report.temperatureRange.min}°C - {report.temperatureRange.max}°C
                  </span>
                </div>
                
                {report.notes && (
                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Notes:</span>
                    <span className="ml-2">{report.notes}</span>
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    View Details
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
            <CardContent className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No reports found matching your criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Reports; 