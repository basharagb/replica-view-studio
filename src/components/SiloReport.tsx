import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, FileText, Printer, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { SearchableDropdown } from './SearchableDropdown';
import { SiloReportData, ReportFilters } from '../types/reports';
import { getAllSiloNumbers, generateSiloReportData } from '../services/reportService';
import { format } from 'date-fns';
import { clearCacheAndReload } from '../utils/cache';

export const SiloReport: React.FC = () => {
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: null,
    endDate: null,
    selectedSilo: undefined
  });
  
  const [reportData, setReportData] = useState<SiloReportData[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const ROWS_PER_PAGE = 24;

  // Pagination calculations
  const totalPages = Math.ceil(reportData.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const currentPageData = reportData.slice(startIndex, endIndex);

  // Get all available silo numbers for dropdown
  const siloOptions = getAllSiloNumbers().map(num => ({
    value: num.toString(),
    label: `Silo ${num}`
  }));

  // Progressive enabling logic
  const isEndDateEnabled = filters.startDate !== null;
  const isGenerateEnabled = filters.startDate !== null && filters.endDate !== null && filters.selectedSilo !== undefined;
  const isPrintEnabled = isGenerated && reportData.length > 0;

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value ? new Date(e.target.value) : null;
    setFilters(prev => ({
      ...prev,
      startDate: newStartDate,
      endDate: newStartDate && prev.endDate && prev.endDate < newStartDate ? null : prev.endDate
    }));
    setIsGenerated(false);
    setCurrentPage(1);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value ? new Date(e.target.value) : null;
    setFilters(prev => ({
      ...prev,
      endDate: newEndDate
    }));
    setIsGenerated(false);
    setCurrentPage(1);
  };

  const handleSiloChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      selectedSilo: value ? parseInt(value) : undefined
    }));
    setIsGenerated(false);
    setCurrentPage(1);
  };

  const handleGenerateReport = async () => {
    if (!isGenerateEnabled) return;
    
    setIsGenerating(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const data = generateSiloReportData(
        filters.selectedSilo!,
        filters.startDate!,
        filters.endDate!
      );
      
      setReportData(data);
      setIsGenerated(true);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintPDF = () => {
    if (!isPrintEnabled) return;
    
    // Create print content with ALL data (not paginated)
    const generatePrintContent = () => {
      const header = `
        <div class="header">
          <h2>Silo ${filters.selectedSilo} Temperature Report</h2>
          <p>Period: ${format(filters.startDate!, 'MMM dd, yyyy HH:mm')} - ${format(filters.endDate!, 'MMM dd, yyyy HH:mm')}</p>
          <p>Total Records: ${reportData.length}</p>
        </div>
      `;
      
      const tableRows = reportData.map(record => `
        <tr>
          <td>${format(record.dateTime, 'MMM dd, yyyy HH:mm:ss')}</td>
          <td>${record.sensorReadings.sensor1.toFixed(1)}°C</td>
          <td>${record.sensorReadings.sensor2.toFixed(1)}°C</td>
          <td>${record.sensorReadings.sensor3.toFixed(1)}°C</td>
          <td>${record.sensorReadings.sensor4.toFixed(1)}°C</td>
          <td>${record.sensorReadings.sensor5.toFixed(1)}°C</td>
          <td>${record.sensorReadings.sensor6.toFixed(1)}°C</td>
          <td>${record.sensorReadings.sensor7.toFixed(1)}°C</td>
          <td>${record.sensorReadings.sensor8.toFixed(1)}°C</td>
          <td class="alarm-${record.alarmStatus.toLowerCase()}">${record.alarmStatus}</td>
          <td>${record.siloTemperature.toFixed(1)}°C</td>
        </tr>
      `).join('');
      
      return `
        ${header}
        <table>
          <thead>
            <tr>
              <th>Date Time</th>
              <th>Sensor 1</th>
              <th>Sensor 2</th>
              <th>Sensor 3</th>
              <th>Sensor 4</th>
              <th>Sensor 5</th>
              <th>Sensor 6</th>
              <th>Sensor 7</th>
              <th>Sensor 8</th>
              <th>Alarm Status</th>
              <th>Max Temp</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      `;
    };
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Silo ${filters.selectedSilo} Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .header { text-align: center; margin-bottom: 20px; }
              .header h2 { margin: 0; color: #333; }
              .header p { margin: 5px 0; color: #666; }
              .alarm-normal { color: green; font-weight: bold; }
              .alarm-warning { color: #f59e0b; font-weight: bold; }
              .alarm-critical { color: red; font-weight: bold; }
              @media print {
                body { margin: 10px; }
                th, td { padding: 4px; font-size: 10px; }
              }
            </style>
          </head>
          <body>
            ${generatePrintContent()}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handlePrintPrinter = () => {
    if (!isPrintEnabled) return;
    
    // Create a temporary print-only version with all data
    const originalBody = document.body.innerHTML;
    const generatePrintContent = () => {
      const header = `
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #333;">Silo ${filters.selectedSilo} Temperature Report</h2>
          <p style="margin: 5px 0; color: #666;">Period: ${format(filters.startDate!, 'MMM dd, yyyy HH:mm')} - ${format(filters.endDate!, 'MMM dd, yyyy HH:mm')}</p>
          <p style="margin: 5px 0; color: #666;">Total Records: ${reportData.length}</p>
        </div>
      `;
      
      const tableRows = reportData.map(record => `
        <tr>
          <td>${format(record.dateTime, 'MMM dd, yyyy HH:mm:ss')}</td>
          <td>${record.sensorReadings.sensor1.toFixed(1)}°C</td>
          <td>${record.sensorReadings.sensor2.toFixed(1)}°C</td>
          <td>${record.sensorReadings.sensor3.toFixed(1)}°C</td>
          <td>${record.sensorReadings.sensor4.toFixed(1)}°C</td>
          <td>${record.sensorReadings.sensor5.toFixed(1)}°C</td>
          <td>${record.sensorReadings.sensor6.toFixed(1)}°C</td>
          <td>${record.sensorReadings.sensor7.toFixed(1)}°C</td>
          <td>${record.sensorReadings.sensor8.toFixed(1)}°C</td>
          <td style="color: ${record.alarmStatus === 'Critical' ? 'red' : record.alarmStatus === 'Warning' ? '#f59e0b' : 'green'}; font-weight: bold;">${record.alarmStatus}</td>
          <td>${record.siloTemperature.toFixed(1)}°C</td>
        </tr>
      `).join('');
      
      return `
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #f2f2f2; font-weight: bold; }
          @media print {
            body { margin: 10px; }
            th, td { padding: 4px; font-size: 10px; }
          }
        </style>
        ${header}
        <table>
          <thead>
            <tr>
              <th>Date Time</th>
              <th>Sensor 1</th>
              <th>Sensor 2</th>
              <th>Sensor 3</th>
              <th>Sensor 4</th>
              <th>Sensor 5</th>
              <th>Sensor 6</th>
              <th>Sensor 7</th>
              <th>Sensor 8</th>
              <th>Alarm Status</th>
              <th>Max Temp</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      `;
    };
    
    // Replace body content temporarily
    document.body.innerHTML = generatePrintContent();
    
    // Print
    window.print();
    
    // Restore original content
    document.body.innerHTML = originalBody;
    
    // Re-attach event listeners (React will handle this automatically on next render)
    clearCacheAndReload();
  };

  const getAlarmStatusBadge = (status: string) => {
    if (status === 'Critical') {
      return <Badge variant="destructive">{status}</Badge>;
    }
    if (status === 'Warning') {
      return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">{status}</Badge>;
    }
    return <Badge variant="default">{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Controls Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Silo Report Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Silo Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Silo</label>
            <SearchableDropdown
              options={siloOptions}
              value={filters.selectedSilo?.toString()}
              onValueChange={handleSiloChange}
              placeholder="Search and select silo..."
              searchPlaceholder="Search silo number..."
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date & Hour</label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={filters.startDate ? format(filters.startDate, "yyyy-MM-dd") : ''}
                  onChange={(e) => {
                    const dateValue = e.target.value;
                    const currentHour = filters.startDate ? format(filters.startDate, "HH") : '00';
                    if (dateValue) {
                      const event = { target: { value: `${dateValue}T${currentHour}:00` } };
                      handleStartDateChange(event as React.ChangeEvent<HTMLInputElement>);
                    }
                  }}
                  className="flex-1"
                />
                <select
                  value={filters.startDate ? format(filters.startDate, "HH") : '00'}
                  onChange={(e) => {
                    const hour = e.target.value;
                    const currentDate = filters.startDate ? format(filters.startDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
                    const event = { target: { value: `${currentDate}T${hour}:00` } };
                    handleStartDateChange(event as React.ChangeEvent<HTMLInputElement>);
                  }}
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
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date & Hour</label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={filters.endDate ? format(filters.endDate, "yyyy-MM-dd") : ''}
                  onChange={(e) => {
                    const dateValue = e.target.value;
                    const currentHour = filters.endDate ? format(filters.endDate, "HH") : '23';
                    if (dateValue) {
                      const event = { target: { value: `${dateValue}T${currentHour}:00` } };
                      handleEndDateChange(event as React.ChangeEvent<HTMLInputElement>);
                    }
                  }}
                  disabled={!isEndDateEnabled}
                  className="flex-1"
                  min={filters.startDate ? format(filters.startDate, "yyyy-MM-dd") : undefined}
                />
                <select
                  value={filters.endDate ? format(filters.endDate, "HH") : '23'}
                  onChange={(e) => {
                    const hour = e.target.value;
                    const currentDate = filters.endDate ? format(filters.endDate, "yyyy-MM-dd") : (filters.startDate ? format(filters.startDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"));
                    const event = { target: { value: `${currentDate}T${hour}:00` } };
                    handleEndDateChange(event as React.ChangeEvent<HTMLInputElement>);
                  }}
                  disabled={!isEndDateEnabled}
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
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleGenerateReport}
              disabled={!isGenerateEnabled || isGenerating}
              className="flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
            >
              <Calendar className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>
            
            <Button
              onClick={handlePrintPDF}
              disabled={!isPrintEnabled}
              variant="outline"
              className="flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
            >
              <Download className="h-4 w-4" />
              Print as PDF
            </Button>
            
            <Button
              onClick={handlePrintPrinter}
              disabled={!isPrintEnabled}
              variant="outline"
              className="flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
            >
              <Printer className="h-4 w-4" />
              Print via Printer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {isGenerated && reportData.length > 0 && (
        <Card className="animate-in slide-in-from-bottom-4 fade-in-0 duration-700 shadow-lg border-0">
          <CardHeader>
            <CardTitle>
              Silo {filters.selectedSilo} Report
              <span className="text-sm font-normal ml-2">
                ({format(filters.startDate!, 'MMM dd, yyyy HH:mm')} - {format(filters.endDate!, 'MMM dd, yyyy HH:mm')})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div id="silo-report-content">
              <div className="header">
                <h2>Silo {filters.selectedSilo} Temperature Report</h2>
                <p>Period: {format(filters.startDate!, 'MMM dd, yyyy HH:mm')} - {format(filters.endDate!, 'MMM dd, yyyy HH:mm')}</p>
                <p>Total Records: {reportData.length}</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full transition-all duration-300">
                  <thead>
                    <tr>
                      <th>Date Time</th>
                      <th>Sensor 1</th>
                      <th>Sensor 2</th>
                      <th>Sensor 3</th>
                      <th>Sensor 4</th>
                      <th>Sensor 5</th>
                      <th>Sensor 6</th>
                      <th>Sensor 7</th>
                      <th>Sensor 8</th>
                      <th>Alarm Status</th>
                      <th>Max Temp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPageData.map((record, index) => (
                      <tr key={startIndex + index} className="transition-all duration-200 hover:bg-gray-50 hover:scale-[1.01] hover:shadow-sm">
                        <td>{format(record.dateTime, 'MMM dd, yyyy HH:mm:ss')}</td>
                        <td>{record.sensorReadings.sensor1.toFixed(1)}°C</td>
                        <td>{record.sensorReadings.sensor2.toFixed(1)}°C</td>
                        <td>{record.sensorReadings.sensor3.toFixed(1)}°C</td>
                        <td>{record.sensorReadings.sensor4.toFixed(1)}°C</td>
                        <td>{record.sensorReadings.sensor5.toFixed(1)}°C</td>
                        <td>{record.sensorReadings.sensor6.toFixed(1)}°C</td>
                        <td>{record.sensorReadings.sensor7.toFixed(1)}°C</td>
                        <td>{record.sensorReadings.sensor8.toFixed(1)}°C</td>
                        <td className={`alarm-${record.alarmStatus.toLowerCase()}`}>
                          {getAlarmStatusBadge(record.alarmStatus)}
                        </td>
                        <td>{record.siloTemperature.toFixed(1)}°C</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 px-4">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, reportData.length)} of {reportData.length} records
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          const distance = Math.abs(page - currentPage);
                          return distance === 0 || distance === 1 || page === 1 || page === totalPages;
                        })
                        .map((page, index, filteredPages) => {
                          const prevPage = filteredPages[index - 1];
                          const showEllipsis = prevPage && page - prevPage > 1;
                          
                          return (
                            <React.Fragment key={page}>
                              {showEllipsis && (
                                <span className="px-2 text-gray-400">...</span>
                              )}
                              <Button
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className="min-w-[2.5rem]"
                              >
                                {page}
                              </Button>
                            </React.Fragment>
                          );
                        })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {isGenerated && reportData.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No data found for the selected period.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
