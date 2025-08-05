import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertTriangle, FileText, Printer, Download } from 'lucide-react';
import { MultiSelectDropdown } from './MultiSelectDropdown';
import { AlarmReportData, ReportFilters } from '../types/reports';
import { getAlarmedSilos, generateAlarmReportData } from '../services/reportService';
import { format } from 'date-fns';

export const AlarmReport: React.FC = () => {
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: null,
    endDate: null,
    selectedSilos: []
  });
  
  const [reportData, setReportData] = useState<AlarmReportData[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Get all alarmed silos for dropdown
  const alarmedSilos = getAlarmedSilos().map(silo => ({
    value: silo.number.toString(),
    label: `Silo ${silo.number}`,
    isAlarmed: true
  }));

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
    } catch (error) {
      console.error('Error generating alarm report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintPDF = () => {
    if (!isPrintEnabled) return;
    
    const printContent = document.getElementById('alarm-report-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Alarm Report - ${filters.selectedSilos?.length} Silos</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .header { text-align: center; margin-bottom: 20px; }
                .alarm-normal { color: green; }
                .alarm-warning { color: orange; }
                .alarm-critical { color: red; }
                .silo-number { font-weight: bold; color: #1f2937; }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handlePrintPrinter = () => {
    if (!isPrintEnabled) return;
    window.print();
  };

  const getAlarmStatusBadge = (status: string) => {
    const variant = status === 'Critical' ? 'destructive' : 
                   status === 'Warning' ? 'secondary' : 'default';
    return <Badge variant={variant}>{status}</Badge>;
  };

  const getSiloNumberBadge = (siloNumber: number) => {
    return <Badge variant="outline" className="font-mono">#{siloNumber}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Controls Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Alarm Report Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Alarmed Silos Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Select Alarmed Silos ({alarmedSilos.length} available)
            </label>
            <MultiSelectDropdown
              options={alarmedSilos}
              selectedValues={filters.selectedSilos?.map(s => s.toString()) || []}
              onSelectionChange={handleSilosChange}
              placeholder="Select alarmed silos..."
              searchPlaceholder="Search alarmed silos..."
              showSelectAll={true}
            />
            {filters.selectedSilos && filters.selectedSilos.length > 0 && (
              <p className="text-xs text-gray-600">
                {filters.selectedSilos.length} silo{filters.selectedSilos.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="datetime-local"
                value={filters.startDate ? format(filters.startDate, "yyyy-MM-dd'T'HH:mm") : ''}
                onChange={handleStartDateChange}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="datetime-local"
                value={filters.endDate ? format(filters.endDate, "yyyy-MM-dd'T'HH:mm") : ''}
                onChange={handleEndDateChange}
                disabled={!isEndDateEnabled}
                className="w-full"
                min={filters.startDate ? format(filters.startDate, "yyyy-MM-dd'T'HH:mm") : undefined}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleGenerateReport}
              disabled={!isGenerateEnabled || isGenerating}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>
            
            <Button
              onClick={handlePrintPDF}
              disabled={!isPrintEnabled}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Print as PDF
            </Button>
            
            <Button
              onClick={handlePrintPrinter}
              disabled={!isPrintEnabled}
              variant="outline"
              className="flex items-center gap-2"
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
                      <th>Silo Temp</th>
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
