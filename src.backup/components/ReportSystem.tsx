import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FileText, AlertTriangle, TrendingUp } from 'lucide-react';
import { SiloReport } from './SiloReport';
import { AlarmReport } from './AlarmReport';
import EnhancedTemperatureGraphs from './EnhancedTemperatureGraphs';

const ReportSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState('graphs');

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Reports & Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 transition-all duration-200">
              <TabsTrigger value="graphs" className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
                <TrendingUp className="h-4 w-4" />
                Temperature Graphs
              </TabsTrigger>
              <TabsTrigger value="silo" className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
                <FileText className="h-4 w-4" />
                Silo Report
              </TabsTrigger>
              <TabsTrigger value="alarm" className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
                <AlertTriangle className="h-4 w-4" />
                Alarm Report
              </TabsTrigger>
            </TabsList>

            <TabsContent value="graphs" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-300">
              <EnhancedTemperatureGraphs />
            </TabsContent>

            <TabsContent value="silo" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-300">
              <SiloReport />
            </TabsContent>

            <TabsContent value="alarm" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-300">
              <AlarmReport />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportSystem;
