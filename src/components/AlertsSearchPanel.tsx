import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Search, AlertTriangle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { alertedSiloSearchService, AlertedSilo } from '../services/alertedSiloSearchService';

interface AlertsSearchPanelProps {
  className?: string;
  onSiloSelect?: (siloNumber: number) => void;
  selectedSilo?: number | null;
}

export const AlertsSearchPanel: React.FC<AlertsSearchPanelProps> = ({ 
  className = '', 
  onSiloSelect,
  selectedSilo 
}) => {
  const [alertedSilos, setAlertedSilos] = useState<AlertedSilo[]>([]);
  const [alertStats, setAlertStats] = useState({ total: 0, critical: 0, warning: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Critical' | 'Warning'>('All');
  const [isVisible, setIsVisible] = useState(true);

  // Load alerted silos on component mount
  const loadAlertedSilos = async (forceRefresh: boolean = false) => {
    try {
      setIsLoading(true);
      const silos = await alertedSiloSearchService.getAllAlertedSilos(forceRefresh);
      const stats = await alertedSiloSearchService.getAlertStats();
      
      setAlertedSilos(silos);
      setAlertStats(stats);
    } catch (error) {
      console.error('Error loading alerted silos:', error);
      setAlertedSilos([]);
      setAlertStats({ total: 0, critical: 0, warning: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlertedSilos();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadAlertedSilos(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Fast search and filtering
  const filteredSilos = alertedSilos.filter(silo => {
    const matchesSearch = searchTerm === '' || 
      silo.number.toString().includes(searchTerm) ||
      silo.searchText.includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || silo.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSiloClick = (siloNumber: number) => {
    if (onSiloSelect) {
      onSiloSelect(siloNumber);
    }
  };

  const handleRefresh = () => {
    alertedSiloSearchService.clearCache();
    loadAlertedSilos(true);
  };

  if (!isVisible) {
    return (
      <div className={`fixed top-4 right-4 z-50 ${className}`}>
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg border-orange-200 hover:border-orange-300"
        >
          <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
          Show Alerts ({alertStats.total})
        </Button>
      </div>
    );
  }

  return (
    <Card className={`fixed top-4 right-4 w-80 z-50 shadow-xl border-orange-200 ${className}`}>
      <CardHeader className="pb-3 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Alerted Silos
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <Badge variant="destructive" className="text-xs">{alertStats.critical}</Badge>
            <span className="text-red-600">Critical Alerts Only</span>
          </div>
          {isLoading && <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
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
          
          {/* Refresh Button */}
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="w-full text-xs h-7"
            disabled={isLoading}
          >
            {isLoading ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
            Refresh Alerts
          </Button>
        </div>

        {/* Alerted Silos List */}
        <div className="max-h-64 overflow-y-auto space-y-1">
          {isLoading ? (
            <div className="text-center py-4 text-sm text-gray-500">
              <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
              Loading alerted silos...
            </div>
          ) : filteredSilos.length > 0 ? (
            filteredSilos.map(silo => (
              <div
                key={silo.number}
                onClick={() => handleSiloClick(silo.number)}
                className={`p-2 rounded border cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedSilo === silo.number 
                    ? 'bg-blue-50 border-blue-300 shadow-sm' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">Silo {silo.number}</span>
                    <Badge 
                      variant={silo.status === 'Critical' ? 'destructive' : 'secondary'}
                      className={`text-xs ${
                        silo.status === 'Critical' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-yellow-500 text-white'
                      }`}
                    >
                      {silo.status.toUpperCase()}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-400">
                    {silo.lastUpdated.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'All' ? (
                'No matching alerted silos found'
              ) : (
                'No alerted silos at this time'
              )}
            </div>
          )}
        </div>

        {/* Summary */}
        {filteredSilos.length > 0 && (
          <div className="text-xs text-gray-500 text-center pt-2 border-t">
            Showing {filteredSilos.length} of {alertStats.total} alerted silos
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsSearchPanel;
