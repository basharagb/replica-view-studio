import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
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
  Eye
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
}

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  format: 'excel' | 'pdf';
  lastUsed: Date;
}

const DataManagement = () => {
  const [importedFiles, setImportedFiles] = useState<ImportedData[]>([
    {
      id: '1',
      fileName: 'silo_readings_2024_08_04.xlsx',
      fileType: 'excel',
      uploadDate: new Date('2024-08-04T10:30:00'),
      recordCount: 150,
      status: 'success',
      size: '2.3 MB'
    },
    {
      id: '2',
      fileName: 'temperature_report.pdf',
      fileType: 'pdf',
      uploadDate: new Date('2024-08-04T09:15:00'),
      recordCount: 75,
      status: 'warning',
      size: '1.8 MB'
    }
  ]);

  const [exportTemplates] = useState<ExportTemplate[]>([
    {
      id: '1',
      name: 'Silo Temperature Report',
      description: 'Complete temperature readings for all silos',
      format: 'excel',
      lastUsed: new Date('2024-08-04T11:00:00')
    },
    {
      id: '2',
      name: 'Test Results Summary',
      description: 'Auto and manual test results with statistics',
      format: 'pdf',
      lastUsed: new Date('2024-08-03T14:30:00')
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
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
      size: fileSize
    };

    setImportedFiles(prev => [newFile, ...prev]);
  };

  const exportToExcel = () => {
    // Create sample data for Excel export
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
    saveAs(dataBlob, 'silo_readings_export.xlsx');
  };

  const exportToPDF = async () => {
    const pdf = new jsPDF();
    
    // Add title
    pdf.setFontSize(20);
    pdf.text('Silo Monitoring System - Data Report', 20, 20);
    
    // Add date
    pdf.setFontSize(12);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    
    // Add sample data
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
    
    pdf.save('silo_readings_report.pdf');
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

  const getFileIcon = (fileType: string) => {
    return fileType === 'excel' ? 
      <FileSpreadsheet className="h-5 w-5 text-green-600" /> : 
      <File className="h-5 w-5 text-red-600" />;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Data Management</h1>
        <p className="text-gray-600">Import and export silo readings data in various formats</p>
      </div>

      {/* Import Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="file-upload" className="block text-sm font-medium mb-2">
                Upload File
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="file-upload"
                  accept=".xlsx,.xls,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop files here, or click to browse
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose File
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: Excel (.xlsx, .xls), PDF (.pdf)
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Import Guidelines</h3>
              <ul className="text-sm text-gray-600 space-y-2">
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
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Quick Export</h3>
              <div className="space-y-3">
                <Button 
                  onClick={exportToExcel}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export to Excel
                </Button>
                <Button 
                  onClick={exportToPDF}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <File className="h-4 w-4 mr-2" />
                  Export to PDF
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Export Templates</h3>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
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
                  <Button className="w-full">
                    Export with Template
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Imported Files */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Imported Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {importedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.fileType)}
                  <div>
                    <p className="text-sm font-medium">{file.fileName}</p>
                    <p className="text-xs text-gray-500">
                      {file.uploadDate.toLocaleDateString()} • {file.size} • {file.recordCount} records
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(file.status)}
                  <Badge className={getStatusColor(file.status)}>
                    {file.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataManagement; 