import React, { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertTriangle, FileText, Printer, Download, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { MultiSelectDropdown } from './MultiSelectDropdown';
import { AlarmReportData, ReportFilters } from '../types/reports';
import { getAlarmedSilos, generateAlarmReportData, clearAlarmedSilosCache } from '../services/reportService';
import { format } from 'date-fns';
import { clearCacheAndReload } from '../utils/cache';

export const AlarmReport: React.FC = () => {
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: null,
    endDate: null,
    selectedSilos: []
  });
  
  const [reportData, setReportData] = useState<AlarmReportData[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(50); // Show 50 records per page

  // Get all alarmed silos for dropdown with memoization for consistency
  const alarmedSilos = useMemo(() => {
    return getAlarmedSilos(refreshKey > 0).map(silo => ({
      value: silo.number.toString(),
      label: `Silo ${silo.number}`,
      isAlarmed: true
    }));
  }, [refreshKey]);

  // Separate counts for better UI display
  const totalAlarmedCount = alarmedSilos.length;
  const selectedCount = filters.selectedSilos?.length || 0;
  const criticalCount = useMemo(() => {
    return getAlarmedSilos(refreshKey > 0).filter(silo => silo.status === 'Critical').length;
  }, [refreshKey]);
  const warningCount = totalAlarmedCount - criticalCount;

  // Progressive enabling logic
  const isEndDateEnabled = filters.startDate !== null;
  const isGenerateEnabled = filters.startDate !== null && 
                            filters.endDate !== null && 
                            filters.selectedSilos && 
                            filters.selectedSilos.length > 0;
  const isPrintEnabled = isGenerated && reportData.length > 0;

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value ? new Date(e.target.value) : null;
    setFilters(prev => ({
      ...prev,
      startDate: newStartDate,
      endDate: newStartDate && prev.endDate && prev.endDate < newStartDate ? null : prev.endDate
    }));
    setIsGenerated(false);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value ? new Date(e.target.value) : null;
    setFilters(prev => ({
      ...prev,
      endDate: newEndDate
    }));
    setIsGenerated(false);
  };

  const handleSilosChange = (values: string[]) => {
    setFilters(prev => ({
      ...prev,
      selectedSilos: values.map(v => parseInt(v))
    }));
    setIsGenerated(false);
  };

  const handleGenerateReport = async () => {
    if (!isGenerateEnabled) return;
    
    setIsGenerating(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const data = generateAlarmReportData(
        filters.selectedSilos!,
        filters.startDate!,
        filters.endDate!
      );
      
      setReportData(data);
      setIsGenerated(true);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefreshData = () => {
    clearAlarmedSilosCache();
    setRefreshKey(prev => prev + 1);
    setIsGenerated(false);
    setReportData([]);
    setCurrentPage(1);
  };

  const handlePrintPDF = () => {
    if (!isPrintEnabled) return;
    
    // Create print content with ALL data (not paginated)
    const generatePrintContent = () => {
      const header = `
        <div class="header">
          <h2>Alarm Report - ${filters.selectedSilos?.length} Silos</h2>
          <p>Period: ${format(filters.startDate!, 'MMM dd, yyyy HH:mm')} - ${format(filters.endDate!, 'MMM dd, yyyy HH:mm')}</p>
          <p>Selected Silos: ${filters.selectedSilos?.join(', ')}</p>
          <p>Total Records: ${reportData.length}</p>
        </div>
      `;
      
      const tableRows = reportData.map(record => `
        <tr>
          <td class="silo-number">#${record.siloNumber}</td>
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
              <th>Silo#</th>
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
            <title>Alarm Report - ${filters.selectedSilos?.length} Silos</title>
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
              .silo-number { font-weight: bold; color: #1f2937; }
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
    
    // Create print content with ALL data (not paginated)
    const generatePrintContent = () => {
      const header = `
        <div class="header">
          <h2>Alarm Report - ${filters.selectedSilos?.length} Silos</h2>
          <p>Period: ${format(filters.startDate!, 'MMM dd, yyyy HH:mm')} - ${format(filters.endDate!, 'MMM dd, yyyy HH:mm')}</p>
          <p>Selected Silos: ${filters.selectedSilos?.join(', ')}</p>
          <p>Total Records: ${reportData.length}</p>
        </div>
      `;
      
      const tableRows = reportData.map(record => `
        <tr>
          <td class="silo-number">#${record.siloNumber}</td>
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
        <html>
          <head>
            <title>Alarm Report - ${filters.selectedSilos?.length} Silos</title>
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
              .silo-number { font-weight: bold; color: #1f2937; }
              @media print {
                body { margin: 10px; }
                th, td { padding: 4px; font-size: 10px; }
              }
            </style>
          </head>
          <body>
            ${header}
            <table>
              <thead>
                <tr>
                  <th>Silo#</th>
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
          </body>
        </html>
      `;
    };
    
    // Store original content
    const originalContent = document.body.innerHTML;
    
    // Replace body content with print content
    document.body.innerHTML = generatePrintContent();
    
    // Trigger print
    window.print();
    
    // Restore original content and reload to reattach React event listeners
    document.body.innerHTML = originalContent;
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

  const getSiloNumberBadge = (siloNumber: number) => {
    return <Badge variant="outline" className="font-mono">#{siloNumber}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Controls Section */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              <span className="text-xl font-semibold">Alarm Report Configuration</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-600 font-medium">{criticalCount} Critical</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-yellow-600 font-medium">{warningCount} Warning</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshData}
                className="ml-2"
              >
                Refresh Data
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Alarmed Silos Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Select Alarmed Silos
              </label>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {totalAlarmedCount} Total Available
                </Badge>
                {selectedCount > 0 && (
                  <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">
                    {selectedCount} Selected
                  </Badge>
                )}
              </div>
            </div>
            <MultiSelectDropdown
              options={alarmedSilos}
              selectedValues={filters.selectedSilos?.map(s => s.toString()) || []}
              onSelectionChange={handleSilosChange}
              placeholder="Select alarmed silos..."
              searchPlaceholder="Search alarmed silos..."
              disabled={!isEndDateEnabled}
              showSelectAll={true}
            />
            {!isEndDateEnabled && (
              <p className="text-xs text-gray-500 italic">Complete date selection to enable silo selection</p>
            )}
            {selectedCount > 0 && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm text-green-700 font-medium">
                  Ready to generate report for {selectedCount} silo{selectedCount !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>

          {/* Date Range */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Start Date & Time
                </label>
                <Input
                  type="datetime-local"
                  value={filters.startDate ? format(filters.startDate, "yyyy-MM-dd'T'HH:mm") : ''}
                  onChange={handleStartDateChange}
                  className="w-full border-2 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  End Date & Time
                </label>
                <Input
                  type="datetime-local"
                  value={filters.endDate ? format(filters.endDate, "yyyy-MM-dd'T'HH:mm") : ''}
                  onChange={handleEndDateChange}
                  disabled={!isEndDateEnabled}
                  min={filters.startDate ? format(filters.startDate, "yyyy-MM-dd'T'HH:mm") : undefined}
                  className={`w-full border-2 transition-colors ${
                    !isEndDateEnabled 
                      ? 'bg-gray-50 cursor-not-allowed border-gray-200' 
                      : 'focus:border-blue-500'
                  }`}
                />
                {!isEndDateEnabled && (
                  <p className="text-xs text-gray-500 italic">Select start date first</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <Button
              onClick={handleGenerateReport}
              disabled={!isGenerateEnabled || isGenerating}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 transition-all duration-200 shadow-lg hover:shadow-xl"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating Report...
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5 mr-2" />
                  Generate Alarm Report
                </>
              )}
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
        <Card>
          <CardHeader>
            <CardTitle>
              Alarm Report - {filters.selectedSilos?.length} Silo{filters.selectedSilos && filters.selectedSilos.length > 1 ? 's' : ''}
              <span className="text-sm font-normal ml-2">
                ({format(filters.startDate!, 'MMM dd, yyyy HH:mm')} - {format(filters.endDate!, 'MMM dd, yyyy HH:mm')})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div id="alarm-report-content">
              <div className="header">
                <h2>Alarm Report</h2>
                <p>Silos: {filters.selectedSilos?.join(', ')}</p>
                <p>Period: {format(filters.startDate!, 'MMM dd, yyyy HH:mm')} - {format(filters.endDate!, 'MMM dd, yyyy HH:mm')}</p>
                <p>Total Records: {reportData.length}</p>
                <p>Showing {Math.min((currentPage - 1) * recordsPerPage + 1, reportData.length)} - {Math.min(currentPage * recordsPerPage, reportData.length)} of {reportData.length} records</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th>Silo#</th>
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
                    {reportData
                      .slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage)
                      .map((record, index) => (
                      <tr key={index}>
                        <td className="silo-number">
                          {getSiloNumberBadge(record.siloNumber)}
                        </td>
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
              {reportData.length > recordsPerPage && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Showing {Math.min((currentPage - 1) * recordsPerPage + 1, reportData.length)} - {Math.min(currentPage * recordsPerPage, reportData.length)} of {reportData.length} records
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.ceil(reportData.length / recordsPerPage) }, (_, i) => i + 1)
                        .filter(page => {
                          const totalPages = Math.ceil(reportData.length / recordsPerPage);
                          if (totalPages <= 7) return true;
                          if (page === 1 || page === totalPages) return true;
                          if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                          return false;
                        })
                        .map((page, index, array) => {
                          const prevPage = array[index - 1];
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
                                className="w-8 h-8 p-0"
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
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(reportData.length / recordsPerPage)))}
                      disabled={currentPage === Math.ceil(reportData.length / recordsPerPage)}
                      className="flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {Math.ceil(reportData.length / recordsPerPage)}
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
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No alarm data found for the selected period.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
