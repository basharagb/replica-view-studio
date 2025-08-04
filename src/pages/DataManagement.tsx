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
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Data Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Import, export, and manage silo monitoring data
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportToExcel()}>
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button variant="outline" onClick={() => exportToPDF()}>
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        <Tabs defaultValue="import" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="import">Import Data</TabsTrigger>
            <TabsTrigger value="files">Imported Files</TabsTrigger>
            <TabsTrigger value="export">Export Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* File Upload */}
              <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <CardHeader>
                  <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>Upload Files</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Drag and drop files here, or click to browse
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Supports Excel (.xlsx, .xls) and PDF files
                    </p>
                    <input
                      type="file"
                      multiple
                      accept=".xlsx,.xls,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      Choose Files
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Upload Settings */}
              <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <CardHeader>
                  <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>Upload Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>Data Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="temperature">Temperature Data</SelectItem>
                        <SelectItem value="humidity">Humidity Data</SelectItem>
                        <SelectItem value="pressure">Pressure Data</SelectItem>
                        <SelectItem value="vibration">Vibration Data</SelectItem>
                        <SelectItem value="level">Level Data</SelectItem>
                        <SelectItem value="flow">Flow Rate Data</SelectItem>
                        <SelectItem value="comprehensive">Comprehensive Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>Priority Level</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>Tags</Label>
                    <Input placeholder="Enter tags separated by commas" />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="encrypt" className="rounded" />
                    <Label htmlFor="encrypt" className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      Encrypt uploaded files
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            {/* Filters */}
            <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardHeader>
                <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                  <div>
                    <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>File Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>Status</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="All status" />
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
                    <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="All categories" />
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
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="sm:col-span-2 lg:col-span-1">
                    <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>Search</Label>
                    <Input placeholder="Search files..." />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Files Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {importedFiles.map((file) => (
                <Card key={file.id} className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getFileIcon(file.fileType)}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {file.fileName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {file.size} • {file.recordCount} records
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {file.isFavorite && <Star className="h-4 w-4 text-yellow-500" />}
                        {file.isEncrypted && <Lock className="h-4 w-4 text-blue-500" />}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className={getStatusColor(file.status)}>
                          {getStatusIcon(file.status)}
                          {file.status}
                        </Badge>
                        <Badge className={getPriorityColor(file.priority)}>
                          {file.priority}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        <p>Category: {file.category}</p>
                        <p>Uploaded: {file.uploadDate.toLocaleDateString()}</p>
                        <p>Last accessed: {file.lastAccessed.toLocaleDateString()}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {file.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {file.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{file.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-1 pt-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleFileView(file)}>
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleFileDownload(file)}>
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleFileFavorite(file.id)}>
                          {file.isFavorite ? <StarOff className="h-3 w-3" /> : <Star className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {exportTemplates.map((template) => (
                <Card key={template.id} className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {template.name}
                      </CardTitle>
                      {template.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {template.description}
                    </p>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <p>Format: {template.format.toUpperCase()}</p>
                      <p>Category: {template.category}</p>
                      <p>Last used: {template.lastUsed.toLocaleDateString()}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {template.sensorTypes.slice(0, 3).map((sensorType, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {getSensorTypeIcon(sensorType)}
                          {sensorType}
                        </Badge>
                      ))}
                      {template.sensorTypes.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.sensorTypes.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        Use Template
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

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
    </div>
  );
};

export default DataManagement; 