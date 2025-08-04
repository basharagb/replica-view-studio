import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Upload, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  File,
  Database,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Trash2,
  Eye,
  Search,
  Filter,
  Star,
  StarOff,
  Lock,
  Unlock,
  Share,
  Copy,
  Edit,
  MoreHorizontal,
  Grid,
  List,
  Thermometer,
  Gauge,
  Activity,
  Zap,
  Droplets,
  Wind
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ImportedData {
  id: string;
  fileName: string;
  fileType: 'excel' | 'pdf';
  uploadDate: Date;
  recordCount: number;
  status: 'success' | 'warning' | 'error';
  size: string;
  tags: string[];
  description?: string;
  isFavorite: boolean;
  isEncrypted: boolean;
  lastAccessed: Date;
  checksum: string;
  version: string;
  category: 'temperature' | 'humidity' | 'pressure' | 'vibration' | 'level' | 'flow' | 'comprehensive' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  sensorTypes: string[];
  dataRange: {
    startDate: Date;
    endDate: Date;
    totalSilos: number;
    totalSensors: number;
  };
}

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  format: 'excel' | 'pdf';
  lastUsed: Date;
  isDefault: boolean;
  category: string;
  sensorTypes: string[];
}

interface FileViewerData {
  headers: string[];
  data: any[][];
  metadata: {
    totalRows: number;
    totalColumns: number;
    fileSize: string;
    lastModified: Date;
    createdBy: string;
    sensorTypes: string[];
    dataRange: {
      startDate: Date;
      endDate: Date;
      totalSilos: number;
      totalSensors: number;
    };
  };
}

const DataManagement = () => {
  const { isDark } = useTheme();
  
  const [importedFiles, setImportedFiles] = useState<ImportedData[]>([
    {
      id: '1',
      fileName: 'comprehensive_sensor_data_2024_08_04.xlsx',
      fileType: 'excel',
      uploadDate: new Date('2024-08-04T10:30:00'),
      recordCount: 1500,
      status: 'success',
      size: '4.2 MB',
      tags: ['comprehensive', 'all-sensors', 'daily', 'automated'],
      description: 'Complete sensor data including temperature, humidity, pressure, vibration, level, and flow rate from all silos',
      isFavorite: true,
      isEncrypted: false,
      lastAccessed: new Date('2024-08-04T15:30:00'),
      checksum: 'a1b2c3d4e5f6',
      version: '2.0',
      category: 'comprehensive',
      priority: 'high',
      sensorTypes: ['temperature', 'humidity', 'pressure', 'vibration', 'level', 'flow'],
      dataRange: {
        startDate: new Date('2024-08-04T00:00:00'),
        endDate: new Date('2024-08-04T23:59:59'),
        totalSilos: 150,
        totalSensors: 900
      }
    },
    {
      id: '2',
      fileName: 'temperature_humidity_report.pdf',
      fileType: 'pdf',
      uploadDate: new Date('2024-08-04T09:15:00'),
      recordCount: 300,
      status: 'warning',
      size: '2.1 MB',
      tags: ['temperature', 'humidity', 'monthly', 'analysis'],
      description: 'Monthly temperature and humidity analysis report',
      isFavorite: false,
      isEncrypted: true,
      lastAccessed: new Date('2024-08-04T12:15:00'),
      checksum: 'b2c3d4e5f6g7',
      version: '1.5',
      category: 'temperature',
      priority: 'medium',
      sensorTypes: ['temperature', 'humidity'],
      dataRange: {
        startDate: new Date('2024-08-01T00:00:00'),
        endDate: new Date('2024-08-31T23:59:59'),
        totalSilos: 75,
        totalSensors: 150
      }
    },
    {
      id: '3',
      fileName: 'pressure_vibration_data.xlsx',
      fileType: 'excel',
      uploadDate: new Date('2024-08-03T14:20:00'),
      recordCount: 800,
      status: 'success',
      size: '3.8 MB',
      tags: ['pressure', 'vibration', 'quarterly', 'maintenance'],
      description: 'Pressure and vibration sensor data for maintenance analysis',
      isFavorite: true,
      isEncrypted: false,
      lastAccessed: new Date('2024-08-04T09:45:00'),
      checksum: 'c3d4e5f6g7h8',
      version: '1.8',
      category: 'pressure',
      priority: 'high',
      sensorTypes: ['pressure', 'vibration'],
      dataRange: {
        startDate: new Date('2024-08-01T00:00:00'),
        endDate: new Date('2024-08-03T23:59:59'),
        totalSilos: 100,
        totalSensors: 200
      }
    }
  ]);

  const [exportTemplates] = useState<ExportTemplate[]>([
    {
      id: '1',
      name: 'Comprehensive Sensor Report',
      description: 'All sensor data including temperature, humidity, pressure, vibration, level, and flow',
      format: 'excel',
      lastUsed: new Date('2024-08-04T11:00:00'),
      isDefault: true,
      category: 'comprehensive',
      sensorTypes: ['temperature', 'humidity', 'pressure', 'vibration', 'level', 'flow']
    },
    {
      id: '2',
      name: 'Temperature & Humidity Summary',
      description: 'Temperature and humidity sensor data with analysis',
      format: 'pdf',
      lastUsed: new Date('2024-08-03T14:30:00'),
      isDefault: false,
      category: 'temperature',
      sensorTypes: ['temperature', 'humidity']
    },
    {
      id: '3',
      name: 'Pressure & Vibration Analysis',
      description: 'Pressure and vibration data for maintenance planning',
      format: 'excel',
      lastUsed: new Date('2024-08-02T16:15:00'),
      isDefault: false,
      category: 'pressure',
      sensorTypes: ['pressure', 'vibration']
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<ImportedData | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSensorType, setFilterSensorType] = useState<string>('all');
  const [showFavorites, setShowFavorites] = useState<boolean>(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerData, setViewerData] = useState<FileViewerData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileType = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') ? 'excel' : 'pdf';
    const fileSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

    // Simulate file processing
    const newFile: ImportedData = {
      id: Date.now().toString(),
      fileName: file.name,
      fileType,
      uploadDate: new Date(),
      recordCount: Math.floor(Math.random() * 2000) + 500,
      status: Math.random() > 0.2 ? 'success' : 'warning',
      size: fileSize,
      tags: ['new', 'uploaded', 'sensor-data'],
      description: `Uploaded ${file.name} with comprehensive sensor data`,
      isFavorite: false,
      isEncrypted: false,
      lastAccessed: new Date(),
      checksum: Math.random().toString(36).substring(2, 8),
      version: '1.0',
      category: 'comprehensive',
      priority: 'medium',
      sensorTypes: ['temperature', 'humidity', 'pressure', 'vibration', 'level', 'flow'],
      dataRange: {
        startDate: new Date(),
        endDate: new Date(),
        totalSilos: Math.floor(Math.random() * 200) + 50,
        totalSensors: Math.floor(Math.random() * 1000) + 200
      }
    };

    setImportedFiles(prev => [newFile, ...prev]);
  };

  const handleFileView = (file: ImportedData) => {
    setSelectedFile(file);
    
    // Simulate comprehensive sensor data loading
    const mockData: FileViewerData = {
      headers: ['Silo ID', 'Temperature (°C)', 'Humidity (%)', 'Pressure (kPa)', 'Vibration (mm/s)', 'Level (%)', 'Flow Rate (L/min)', 'Status', 'Location', 'Timestamp'],
      data: [
        ['S001', '32.5', '65.2', '101.3', '2.1', '85.3', '45.2', 'Normal', 'Zone A', '2024-08-04 12:30:00'],
        ['S002', '28.9', '58.7', '100.8', '1.8', '92.1', '38.7', 'Normal', 'Zone B', '2024-08-04 12:30:00'],
        ['S003', '35.2', '72.4', '102.1', '3.5', '78.9', '52.1', 'Warning', 'Zone C', '2024-08-04 12:30:00'],
        ['S004', '42.1', '85.6', '103.8', '4.2', '45.2', '28.9', 'Critical', 'Zone D', '2024-08-04 12:30:00'],
        ['S005', '31.8', '61.3', '101.1', '2.3', '88.7', '42.8', 'Normal', 'Zone A', '2024-08-04 12:30:00'],
        ['S006', '29.4', '55.9', '100.5', '1.6', '94.2', '35.4', 'Normal', 'Zone B', '2024-08-04 12:30:00'],
        ['S007', '38.7', '78.2', '102.8', '3.8', '67.3', '48.9', 'Warning', 'Zone C', '2024-08-04 12:30:00'],
        ['S008', '33.2', '63.8', '101.4', '2.4', '91.5', '39.6', 'Normal', 'Zone D', '2024-08-04 12:30:00']
      ],
      metadata: {
        totalRows: 8,
        totalColumns: 10,
        fileSize: file.size,
        lastModified: file.uploadDate,
        createdBy: 'System User',
        sensorTypes: file.sensorTypes,
        dataRange: file.dataRange
      }
    };
    
    setViewerData(mockData);
    setIsViewerOpen(true);
  };

  const handleFileDownload = (file: ImportedData) => {
    if (file.fileType === 'excel') {
      exportToExcel(file.fileName, file.sensorTypes);
    } else {
      exportToPDF(file.fileName, file.sensorTypes);
    }
  };

  const handleFileDelete = (fileId: string) => {
    setImportedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleFileFavorite = (fileId: string) => {
    setImportedFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, isFavorite: !f.isFavorite } : f
    ));
  };

  const exportToExcel = (filename?: string, sensorTypes?: string[]) => {
    const data = [
      { 
        SiloID: 'S001', 
        Temperature: 32.5, 
        Humidity: 65.2, 
        Pressure: 101.3, 
        Vibration: 2.1, 
        Level: 85.3, 
        FlowRate: 45.2, 
        Status: 'Normal', 
        Timestamp: '2024-08-04 12:30:00' 
      },
      { 
        SiloID: 'S002', 
        Temperature: 28.9, 
        Humidity: 58.7, 
        Pressure: 100.8, 
        Vibration: 1.8, 
        Level: 92.1, 
        FlowRate: 38.7, 
        Status: 'Normal', 
        Timestamp: '2024-08-04 12:30:00' 
      },
      { 
        SiloID: 'S003', 
        Temperature: 35.2, 
        Humidity: 72.4, 
        Pressure: 102.1, 
        Vibration: 3.5, 
        Level: 78.9, 
        FlowRate: 52.1, 
        Status: 'Warning', 
        Timestamp: '2024-08-04 12:30:00' 
      }
    ];

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sensor Data');
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(dataBlob, filename || 'comprehensive_sensor_data.xlsx');
  };

  const exportToPDF = (filename?: string, sensorTypes?: string[]) => {
    const pdf = new jsPDF();
    
    pdf.setFontSize(20);
    pdf.text('Silo Monitoring System - Comprehensive Sensor Report', 20, 20);
    
    pdf.setFontSize(12);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    pdf.text(`Sensor Types: ${sensorTypes?.join(', ') || 'All sensors'}`, 20, 40);
    
    pdf.setFontSize(10);
    const data = [
      ['Silo ID', 'Temperature (°C)', 'Humidity (%)', 'Pressure (kPa)', 'Vibration (mm/s)', 'Level (%)', 'Flow Rate (L/min)', 'Status'],
      ['S001', '32.5', '65.2', '101.3', '2.1', '85.3', '45.2', 'Normal'],
      ['S002', '28.9', '58.7', '100.8', '1.8', '92.1', '38.7', 'Normal'],
      ['S003', '35.2', '72.4', '102.1', '3.5', '78.9', '52.1', 'Warning'],
      ['S004', '42.1', '85.6', '103.8', '4.2', '45.2', '28.9', 'Critical']
    ];
    
    pdf.autoTable({
      head: [data[0]],
      body: data.slice(1),
      startY: 50,
      styles: { fontSize: 8 }
    });
    
    pdf.save(filename || 'comprehensive_sensor_report.pdf');
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
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getSensorTypeIcon = (sensorType: string) => {
    switch (sensorType) {
      case 'temperature': return <Thermometer className="h-4 w-4 text-red-500" />;
      case 'humidity': return <Droplets className="h-4 w-4 text-blue-500" />;
      case 'pressure': return <Gauge className="h-4 w-4 text-purple-500" />;
      case 'vibration': return <Activity className="h-4 w-4 text-orange-500" />;
      case 'level': return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'flow': return <Wind className="h-4 w-4 text-green-500" />;
      default: return <Database className="h-4 w-4 text-gray-500" />;
    }
  };

  const getFileIcon = (fileType: string) => {
    return fileType === 'excel' ? 
      <FileSpreadsheet className="h-5 w-5 text-green-600" /> : 
      <File className="h-5 w-5 text-red-600" />;
  };

  const filteredFiles = importedFiles.filter(file => {
    const matchesCategory = filterCategory === 'all' || file.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || file.status === filterStatus;
    const matchesSensorType = filterSensorType === 'all' || file.sensorTypes.includes(filterSensorType);
    const matchesSearch = searchTerm === '' || 
      file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFavorites = !showFavorites || file.isFavorite;
    
    return matchesCategory && matchesStatus && matchesSensorType && matchesSearch && matchesFavorites;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Comprehensive Sensor Data Management
        </h1>
        <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Import, view, and manage comprehensive sensor data including temperature, humidity, pressure, vibration, level, and flow rate
        </p>
      </div>

      {/* Import Section */}
      <Card className={`mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : ''}`}>
            <Upload className="h-5 w-5" />
            Import Sensor Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="file-upload" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Upload Sensor Data File
              </Label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300'
              }`}>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="file-upload"
                  accept=".xlsx,.xls,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className={`h-8 w-8 mx-auto mb-2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Drag and drop sensor data files here, or click to browse
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className={isDark ? 'border-gray-600 text-white hover:bg-gray-700' : ''}
                >
                  Choose File
                </Button>
                <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Supported formats: Excel (.xlsx, .xls), PDF (.pdf)
                </p>
              </div>
            </div>

            <div>
              <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Sensor Data Guidelines
              </h3>
              <ul className={`text-sm space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>• Excel files should include: SiloID, Temperature, Humidity, Pressure, Vibration, Level, Flow Rate</li>
                <li>• PDF files should contain structured sensor data tables</li>
                <li>• Maximum file size: 50 MB for comprehensive sensor data</li>
                <li>• Supported date formats: YYYY-MM-DD HH:MM:SS</li>
                <li>• Temperature in Celsius, Humidity in %, Pressure in kPa</li>
                <li>• Vibration in mm/s, Level in %, Flow Rate in L/min</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Section */}
      <Card className={`mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : ''}`}>
            <Download className="h-5 w-5" />
            Export Sensor Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Quick Export
              </h3>
              <div className="space-y-3">
                <Button 
                  onClick={() => exportToExcel()}
                  className={`w-full justify-start ${isDark ? 'border-gray-600 text-white hover:bg-gray-700' : ''}`}
                  variant="outline"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export All Sensor Data to Excel
                </Button>
                <Button 
                  onClick={() => exportToPDF()}
                  className={`w-full justify-start ${isDark ? 'border-gray-600 text-white hover:bg-gray-700' : ''}`}
                  variant="outline"
                >
                  <File className="h-4 w-4 mr-2" />
                  Export All Sensor Data to PDF
                </Button>
              </div>
            </div>

            <div>
              <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Export Templates
              </h3>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger className={isDark ? 'bg-gray-800 border-gray-600 text-white' : ''}>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {exportTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTemplate && (
                <div className="mt-3">
                  <Button className={`w-full ${isDark ? 'bg-blue-600 hover:bg-blue-700' : ''}`}>
                    Export with Template
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Management Section */}
      <Card className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : ''}`}>
              <Database className="h-5 w-5" />
              Sensor Data Files ({filteredFiles.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className={isDark ? 'border-gray-600 text-white hover:bg-gray-700' : ''}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Search sensor data files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : ''}
                />
              </div>
              <div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className={isDark ? 'bg-gray-800 border-gray-600 text-white' : ''}>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="temperature">Temperature</SelectItem>
                    <SelectItem value="humidity">Humidity</SelectItem>
                    <SelectItem value="pressure">Pressure</SelectItem>
                    <SelectItem value="vibration">Vibration</SelectItem>
                    <SelectItem value="level">Level</SelectItem>
                    <SelectItem value="flow">Flow Rate</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className={isDark ? 'bg-gray-800 border-gray-600 text-white' : ''}>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filterSensorType} onValueChange={setFilterSensorType}>
                  <SelectTrigger className={isDark ? 'bg-gray-800 border-gray-600 text-white' : ''}>
                    <SelectValue placeholder="Sensor Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sensors</SelectItem>
                    <SelectItem value="temperature">Temperature</SelectItem>
                    <SelectItem value="humidity">Humidity</SelectItem>
                    <SelectItem value="pressure">Pressure</SelectItem>
                    <SelectItem value="vibration">Vibration</SelectItem>
                    <SelectItem value="level">Level</SelectItem>
                    <SelectItem value="flow">Flow Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant={showFavorites ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFavorites(!showFavorites)}
                className={isDark ? 'border-gray-600 text-white hover:bg-gray-700' : ''}
              >
                <Star className="h-4 w-4 mr-2" />
                Favorites
              </Button>
            </div>
          </div>

          {/* Files Grid */}
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
            {filteredFiles.map((file) => (
              <div key={file.id} className={`border rounded-lg p-4 ${
                isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getFileIcon(file.fileType)}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : ''}`}>
                        {file.fileName}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {file.size} • {file.recordCount} records • {file.dataRange.totalSilos} silos
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFileFavorite(file.id)}
                      className={isDark ? 'text-gray-300 hover:text-white' : ''}
                    >
                      {file.isFavorite ? <Star className="h-4 w-4 fill-yellow-400" /> : <StarOff className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(file.status)}>
                      {file.status}
                    </Badge>
                    <Badge className={getPriorityColor(file.priority)}>
                      {file.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                      {file.category}
                    </span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                      {file.uploadDate.toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                {file.description && (
                  <p className={`text-xs mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {file.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {file.sensorTypes.slice(0, 3).map((sensorType, index) => (
                    <Badge key={index} variant="secondary" className="text-xs flex items-center gap-1">
                      {getSensorTypeIcon(sensorType)}
                      {sensorType}
                    </Badge>
                  ))}
                  {file.sensorTypes.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{file.sensorTypes.length - 3} more
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFileView(file)}
                      className={isDark ? 'text-gray-300 hover:text-white' : ''}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFileDownload(file)}
                      className={isDark ? 'text-gray-300 hover:text-white' : ''}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFileDelete(file.id)}
                      className={isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-1">
                    {file.isEncrypted && <Lock className="h-4 w-4 text-blue-500" />}
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      v{file.version}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredFiles.length === 0 && (
            <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <p>No sensor data files found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Viewer Dialog */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className={`max-w-6xl ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
          <DialogHeader>
            <DialogTitle className={isDark ? 'text-white' : ''}>
              {selectedFile?.fileName}
            </DialogTitle>
          </DialogHeader>
          
          {viewerData && (
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className={isDark ? 'bg-gray-700' : ''}>
                <TabsTrigger value="preview">Sensor Data Preview</TabsTrigger>
                <TabsTrigger value="metadata">File Metadata</TabsTrigger>
                <TabsTrigger value="sensors">Sensor Types</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview" className="mt-4">
                <div className={`border rounded-lg ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                        <tr>
                          {viewerData.headers.map((header, index) => (
                            <th key={index} className={`px-4 py-2 text-left text-sm font-medium ${
                              isDark ? 'text-gray-200 border-gray-600' : 'text-gray-700 border-gray-200'
                            } border-b`}>
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {viewerData.data.map((row, rowIndex) => (
                          <tr key={rowIndex} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className={`px-4 py-2 text-sm border-b ${
                                isDark ? 'text-gray-300 border-gray-600' : 'text-gray-700 border-gray-200'
                              }`}>
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="metadata" className="mt-4">
                <div className={`border rounded-lg p-4 ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200'}`}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                        Total Rows
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {viewerData.metadata.totalRows}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                        Total Columns
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {viewerData.metadata.totalColumns}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                        File Size
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {viewerData.metadata.fileSize}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                        Created By
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {viewerData.metadata.createdBy}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                        Data Range
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {viewerData.metadata.dataRange.startDate.toLocaleDateString()} - {viewerData.metadata.dataRange.endDate.toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                        Total Silos
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {viewerData.metadata.dataRange.totalSilos}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="sensors" className="mt-4">
                <div className={`border rounded-lg p-4 ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Sensor Types in this File
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {viewerData.metadata.sensorTypes.map((sensorType, index) => (
                      <div key={index} className={`flex items-center space-x-2 p-2 rounded ${
                        isDark ? 'bg-gray-600' : 'bg-gray-100'
                      }`}>
                        {getSensorTypeIcon(sensorType)}
                        <span className={`text-sm capitalize ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                          {sensorType}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          <div className="mt-4 flex justify-between items-center">
            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Total Rows: {viewerData?.metadata.totalRows} | 
              Total Columns: {viewerData?.metadata.totalColumns} | 
              File Size: {viewerData?.metadata.fileSize}
            </div>
            <Button
              onClick={() => selectedFile && handleFileDownload(selectedFile)}
              className={isDark ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataManagement; 