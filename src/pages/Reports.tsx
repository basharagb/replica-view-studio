import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

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

  // Mock data for reports
  const mockReports: TestReport[] = [
    {
      id: '1',
      type: 'auto',
      startTime: new Date('2024-08-04T10:30:00'),
      endTime: new Date('2024-08-04T10:35:00'),
      duration: 300,
      silosTested: 150,
      status: 'completed',
      temperatureRange: { min: 22.1, max: 47.5 },
      notes: 'All silos tested successfully'
    },
    {
      id: '2',
      type: 'manual',
      startTime: new Date('2024-08-04T09:15:00'),
      endTime: new Date('2024-08-04T09:20:00'),
      duration: 300,
      silosTested: 5,
      status: 'completed',
      temperatureRange: { min: 28.8, max: 43.4 },
      notes: 'Selected silos tested'
    },
    {
      id: '3',
      type: 'auto',
      startTime: new Date('2024-08-04T08:00:00'),
      endTime: new Date('2024-08-04T08:05:00'),
      duration: 300,
      silosTested: 150,
      status: 'completed',
      temperatureRange: { min: 20.5, max: 49.2 },
      notes: 'Random data generation test'
    },
    {
      id: '4',
      type: 'manual',
      startTime: new Date('2024-08-04T07:30:00'),
      endTime: new Date('2024-08-04T07:32:00'),
      duration: 120,
      silosTested: 3,
      status: 'failed',
      temperatureRange: { min: 25.0, max: 35.0 },
      notes: 'Connection timeout'
    }
  ];

  const filteredReports = mockReports.filter(report => {
    const matchesType = filterType === 'all' || report.type === filterType;
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesSearch = report.id.includes(searchTerm) || 
                         report.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Test Reports</h1>
        <p className="text-gray-600">View and filter test history for manual and automatic tests</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Test Type</label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="manual">Manual Tests</SelectItem>
              <SelectItem value="auto">Auto Tests</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
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

        <div>
          <label className="block text-sm font-medium mb-2">Search</label>
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-end">
          <Button 
            onClick={() => {
              setFilterType('all');
              setFilterStatus('all');
              setSearchTerm('');
            }}
            variant="outline"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Test #{report.id}
                    <Badge className={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                    <Badge variant={report.type === 'auto' ? 'default' : 'secondary'}>
                      {report.type.toUpperCase()}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(report.startTime)} - {formatDate(report.endTime)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-semibold">{formatDuration(report.duration)}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Silos Tested</p>
                  <p className="font-semibold">{report.silosTested}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Temperature Range</p>
                  <p className="font-semibold">{report.temperatureRange.min}°C - {report.temperatureRange.max}°C</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Notes</p>
                  <p className="text-sm">{report.notes || 'No notes'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredReports.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No reports found matching your filters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Reports; 