import React, { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertTriangle, FileText, Printer, Download, Clock, CheckCircle, XCircle, Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { MultiSelectDropdown } from './MultiSelectDropdown';
import { AlarmReportData, ReportFilters } from '../types/reports';
import { getAlarmedSilos, generateAlarmReportData, clearAlarmedSilosCache } from '../services/reportService';
import { alertedSiloSearchService, AlertedSilo } from '../services/alertedSiloSearchService';
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
  
  const ROWS_PER_PAGE = 24;
  const totalPages = Math.ceil(reportData.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const currentPageData = reportData.slice(startIndex, endIndex);

  // Enhanced alarmed silos management with fast search
  const [alertedSilos, setAlertedSilos] = useState<AlertedSilo[]>([]);
  const [alertStats, setAlertStats] = useState({ total: 0, critical: 0, warning: 0 });
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Critical' | 'Warning'>('All');

  // Load alerted silos data with enhanced search service
  useEffect(() => {
    const loadAlertedSilos = async () => {
      try {
        setIsLoadingAlerts(true);
        const silos = await alertedSiloSearchService.getAllAlertedSilos(refreshKey > 0);
        const stats = await alertedSiloSearchService.getAlertStats();
        
        setAlertedSilos(silos);
        setAlertStats(stats);
      } catch (error) {
        console.error('Error loading alerted silos:', error);
        setAlertedSilos([]);
        setAlertStats({ total: 0, critical: 0, warning: 0 });
      } finally {
        setIsLoadingAlerts(false);
      }
    };

    loadAlertedSilos();
  }, [refreshKey]);

  // Fast search and filtering for dropdown options
  const filteredAlertedSilos = useMemo(() => {
    return alertedSilos.filter(silo => {
      const matchesSearch = searchTerm === '' || 
        silo.number.toString().includes(searchTerm) ||
        silo.searchText.includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || silo.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [alertedSilos, searchTerm, statusFilter]);

  // Convert to dropdown format
  const alarmedSilosDropdownOptions = useMemo(() => {
    return filteredAlertedSilos.map(silo => ({
      value: silo.number.toString(),
      label: `Silo ${silo.number} (${silo.status})`,
      isAlarmed: true
    }));
  }, [filteredAlertedSilos]);

  // Counts for UI display
  const selectedCount = filters.selectedSilos?.length || 0;

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
      
      const data = await generateAlarmReportData(
        filters.selectedSilos!,
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

  const handleRefreshData = () => {
    alertedSiloSearchService.clearCache();
    clearAlarmedSilosCache();
    setRefreshKey(prev => prev + 1);
    setIsGenerated(false);
    setReportData([]);
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
                <span className="text-red-600 font-medium">{alertStats.critical} Critical Alerts Only</span>
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
                  {alertStats.total} Total Available
                </Badge>
                {selectedCount > 0 && (
                  <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">
                    {selectedCount} Selected
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Fast Search Controls */}
            <div className="space-y-2">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Fast search alerted silos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-8 text-sm"
                />
              </div>
              
              {/* Status Filter Buttons - Only Critical alerts shown */}
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="destructive"
                  className="text-xs h-6 px-2 flex-1"
                  disabled
                >
                  Critical Only ({alertStats.critical})
                </Button>
              </div>
              
              {/* Search Results Info */}
              {(searchTerm || statusFilter !== 'All') && (
                <div className="text-xs text-gray-500">
                  Showing {filteredAlertedSilos.length} of {alertStats.total} alerted silos
                  {isLoadingAlerts && <RefreshCw className="inline h-3 w-3 animate-spin ml-2" />}
                </div>
              )}
            </div>

            <MultiSelectDropdown
              options={alarmedSilosDropdownOptions}
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
                  Start Date & Hour
                </label>
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
                    className="flex-1 border-2 focus:border-blue-500 transition-colors"
                  />
                  <select
                    value={filters.startDate ? format(filters.startDate, "HH") : '00'}
                    onChange={(e) => {
                      const hour = e.target.value;
                      const currentDate = filters.startDate ? format(filters.startDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
                      const event = { target: { value: `${currentDate}T${hour}:00` } };
                      handleStartDateChange(event as React.ChangeEvent<HTMLInputElement>);
                    }}
                    className="w-20 px-2 py-1 border-2 border-gray-300 rounded focus:border-blue-500 transition-colors"
                  >
                    {Array.from({length: 24}, (_, i) => (
                      <option key={i} value={i.toString().padStart(2, '0')}>
                        {i.toString().padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  End Date & Hour
                </label>
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
                    className={`flex-1 border-2 transition-colors ${
                      !isEndDateEnabled 
                        ? 'bg-gray-50 cursor-not-allowed border-gray-200' 
                        : 'focus:border-blue-500'
                    }`}
                  />
                  <select
                    value={filters.endDate ? format(filters.endDate, "HH") : '23'}
                    onChange={(e) => {
                      const hour = e.target.value;
                      const currentDate = filters.endDate ? format(filters.endDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
                      const event = { target: { value: `${currentDate}T${hour}:00` } };
                      handleEndDateChange(event as React.ChangeEvent<HTMLInputElement>);
                    }}
                    disabled={!isEndDateEnabled}
                    className={`w-20 px-2 py-1 border-2 rounded transition-colors ${
                      !isEndDateEnabled 
                        ? 'bg-gray-50 cursor-not-allowed border-gray-200' 
                        : 'border-gray-300 focus:border-blue-500'
                    }`}
                  >
                    {Array.from({length: 24}, (_, i) => (
                      <option key={i} value={i.toString().padStart(2, '0')}>
                        {i.toString().padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>
                </div>
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
                    {reportData.map((record, index) => (
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
