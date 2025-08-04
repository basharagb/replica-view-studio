import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
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
  List
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
  category: 'temperature' | 'performance' | 'maintenance' | 'reports' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  format: 'excel' | 'pdf';
  lastUsed: Date;
  isDefault: boolean;
  category: string;
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
  };
}

const DataManagement = () => {
  const { isDark } = useTheme();
  
  const [importedFiles, setImportedFiles] = useState<ImportedData[]>([
    {
      id: '1',
      fileName: 'silo_readings_2024_08_04.xlsx',
      fileType: 'excel',
      uploadDate: new Date('2024-08-04T10:30:00'),
      recordCount: 150,
      status: 'success',
      size: '2.3 MB',
      tags: ['temperature', 'daily', 'automated'],
      description: 'Daily temperature readings from all silos',
      isFavorite: true,
      isEncrypted: false,
      lastAccessed: new Date('2024-08-04T15:30:00'),
      checksum: 'a1b2c3d4e5f6',
      version: '1.0',
      category: 'temperature',
      priority: 'high'
    },
    {
      id: '2',
      fileName: 'temperature_report.pdf',
      fileType: 'pdf',
      uploadDate: new Date('2024-08-04T09:15:00'),
      recordCount: 75,
      status: 'warning',
      size: '1.8 MB',
      tags: ['report', 'monthly', 'analysis'],
      description: 'Monthly temperature analysis report',
      isFavorite: false,
      isEncrypted: true,
      lastAccessed: new Date('2024-08-04T12:15:00'),
      checksum: 'b2c3d4e5f6g7',
      version: '2.1',
      category: 'reports',
      priority: 'medium'
    }
  ]);

  const [exportTemplates] = useState<ExportTemplate[]>([
    {
      id: '1',
      name: 'Silo Temperature Report',
      description: 'Complete temperature readings for all silos',
      format: 'excel',
      lastUsed: new Date('2024-08-04T11:00:00'),
      isDefault: true,
      category: 'temperature'
    },
    {
      id: '2',
      name: 'Test Results Summary',
      description: 'Auto and manual test results with statistics',
      format: 'pdf',
      lastUsed: new Date('2024-08-03T14:30:00'),
      isDefault: false,
      category: 'reports'
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<ImportedData | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
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
      recordCount: Math.floor(Math.random() * 200) + 50,
      status: Math.random() > 0.2 ? 'success' : 'warning',
      size: fileSize,
      tags: ['new', 'uploaded'],
      description: `Uploaded ${file.name}`,
      isFavorite: false,
      isEncrypted: false,
      lastAccessed: new Date(),
      checksum: Math.random().toString(36).substring(2, 8),
      version: '1.0',
      category: 'other',
      priority: 'medium'
    };

    setImportedFiles(prev => [newFile, ...prev]);
  };

  const handleFileView = (file: ImportedData) => {
    setSelectedFile(file);
    
    // Simulate file data loading
    const mockData: FileViewerData = {
      headers: ['Silo ID', 'Temperature (°C)', 'Status', 'Timestamp', 'Location'],
      data: [
        ['S001', '32.5', 'Normal', '2024-08-04 12:30:00', 'Zone A'],
        ['S002', '28.9', 'Normal', '2024-08-04 12:30:00', 'Zone B'],
        ['S003', '35.2', 'Warning', '2024-08-04 12:30:00', 'Zone C'],
        ['S004', '42.1', 'Critical', '2024-08-04 12:30:00', 'Zone D'],
        ['S005', '31.8', 'Normal', '2024-08-04 12:30:00', 'Zone A'],
        ['S006', '29.4', 'Normal', '2024-08-04 12:30:00', 'Zone B'],
        ['S007', '38.7', 'Warning', '2024-08-04 12:30:00', 'Zone C'],
        ['S008', '33.2', 'Normal', '2024-08-04 12:30:00', 'Zone D']
      ],
      metadata: {
        totalRows: 8,
        totalColumns: 5,
        fileSize: file.size,
        lastModified: file.uploadDate,
        createdBy: 'System User'
      }
    };
    
    setViewerData(mockData);
    setIsViewerOpen(true);
  };

  const handleFileDownload = (file: ImportedData) => {
    if (file.fileType === 'excel') {
      exportToExcel(file.fileName);
    } else {
      exportToPDF(file.fileName);
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

  const exportToExcel = (filename?: string) => {
    const data = [
      { SiloID: 'S001', Temperature: 32.5, Status: 'Normal', Timestamp: '2024-08-04 12:30:00' },
      { SiloID: 'S002', Temperature: 28.9, Status: 'Normal', Timestamp: '2024-08-04 12:30:00' },
      { SiloID: 'S003', Temperature: 35.2, Status: 'Warning', Timestamp: '2024-08-04 12:30:00' },
      { SiloID: 'S004', Temperature: 42.1, Status: 'Critical', Timestamp: '2024-08-04 12:30:00' },
      { SiloID: 'S005', Temperature: 31.8, Status: 'Normal', Timestamp: '2024-08-04 12:30:00' }
    ];

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Silo Readings');
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(dataBlob, filename || 'silo_readings_export.xlsx');
  };

  const exportToPDF = (filename?: string) => {
    const pdf = new jsPDF();
    
    pdf.setFontSize(20);
    pdf.text('Silo Monitoring System - Data Report', 20, 20);
    
    pdf.setFontSize(12);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    
    pdf.setFontSize(10);
    const data = [
      ['Silo ID', 'Temperature (°C)', 'Status', 'Timestamp'],
      ['S001', '32.5', 'Normal', '2024-08-04 12:30:00'],
      ['S002', '28.9', 'Normal', '2024-08-04 12:30:00'],
      ['S003', '35.2', 'Warning', '2024-08-04 12:30:00'],
      ['S004', '42.1', 'Critical', '2024-08-04 12:30:00'],
      ['S005', '31.8', 'Normal', '2024-08-04 12:30:00']
    ];
    
    pdf.autoTable({
      head: [data[0]],
      body: data.slice(1),
      startY: 40,
      styles: { fontSize: 8 }
    });
    
    pdf.save(filename || 'silo_readings_report.pdf');
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

  const getFileIcon = (fileType: string) => {
    return fileType === 'excel' ? 
      <FileSpreadsheet className="h-5 w-5 text-green-600" /> : 
      <File className="h-5 w-5 text-red-600" />;
  };

  const filteredFiles = importedFiles.filter(file => {
    const matchesCategory = filterCategory === 'all' || file.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || file.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFavorites = !showFavorites || file.isFavorite;
    
    return matchesCategory && matchesStatus && matchesSearch && matchesFavorites;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Data Management
        </h1>
        <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Import, view, and manage silo readings data in various formats
        </p>
      </div>

      {/* Import Section */}
      <Card className={`mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : ''}`}>
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="file-upload" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Upload File
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
                  Drag and drop files here, or click to browse
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
                Import Guidelines
              </h3>
              <ul className={`text-sm space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>• Excel files should have columns: SiloID, Temperature, Status, Timestamp</li>
                <li>• PDF files should contain structured data tables</li>
                <li>• Maximum file size: 10 MB</li>
                <li>• Supported date formats: YYYY-MM-DD HH:MM:SS</li>
                <li>• Temperature values should be in Celsius (°C)</li>
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
            Export Data
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
                  Export to Excel
                </Button>
                <Button 
                  onClick={() => exportToPDF()}
                  className={`w-full justify-start ${isDark ? 'border-gray-600 text-white hover:bg-gray-700' : ''}`}
                  variant="outline"
                >
                  <File className="h-4 w-4 mr-2" />
                  Export to PDF
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
              Imported Files ({filteredFiles.length})
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Search files..."
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
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="reports">Reports</SelectItem>
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
                        {file.size} • {file.recordCount} records
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
              <p>No files found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Viewer Dialog */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className={`max-w-4xl ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
          <DialogHeader>
            <DialogTitle className={isDark ? 'text-white' : ''}>
              {selectedFile?.fileName}
            </DialogTitle>
          </DialogHeader>
          
          {viewerData && (
            <div className="mt-4">
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
              
              <div className="mt-4 flex justify-between items-center">
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Total Rows: {viewerData.metadata.totalRows} | 
                  Total Columns: {viewerData.metadata.totalColumns} | 
                  File Size: {viewerData.metadata.fileSize}
                </div>
                <Button
                  onClick={() => selectedFile && handleFileDownload(selectedFile)}
                  className={isDark ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataManagement; 