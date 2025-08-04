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
    <div className="p-6">
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Test Reports
        </h1>
        <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          View and filter test history and results
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Test Type
          </label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className={isDark ? 'bg-gray-800 border-gray-600 text-white' : ''}>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="auto">Auto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Status
          </label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className={isDark ? 'bg-gray-800 border-gray-600 text-white' : ''}>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Search
          </label>
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : ''}
          />
        </div>

        <div className="flex items-end">
          <Button 
            variant="outline" 
            className={isDark ? 'border-gray-600 text-white hover:bg-gray-700' : ''}
          >
            Export Reports
          </Button>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className={isDark ? 'text-white' : ''}>
                  {report.id}
                </CardTitle>
                <Badge className={getStatusColor(report.status)}>
                  {report.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Test Type
                  </p>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                  </p>
                </div>
                
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Duration
                  </p>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatDuration(report.duration)}
                  </p>
                </div>
                
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Silos Tested
                  </p>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {report.silosTested}
                  </p>
                </div>
                
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Temperature Range
                  </p>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {report.temperatureRange.min}°C - {report.temperatureRange.max}°C
                  </p>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Start Time
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {formatDate(report.startTime)}
                  </p>
                </div>
                
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    End Time
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {formatDate(report.endTime)}
                  </p>
                </div>
                
                {report.notes && (
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      Notes
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {report.notes}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <p>No reports found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Reports; 