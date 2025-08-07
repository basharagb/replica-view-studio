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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Reports & Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="graphs" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Temperature Graphs
              </TabsTrigger>
              <TabsTrigger value="silo" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Silo Report
              </TabsTrigger>
              <TabsTrigger value="alarm" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Alarm Report
              </TabsTrigger>
            </TabsList>

            <TabsContent value="graphs" className="space-y-6">
              <EnhancedTemperatureGraphs />
            </TabsContent>

            <TabsContent value="silo" className="space-y-6">
              <SiloReport />
            </TabsContent>

            <TabsContent value="alarm" className="space-y-6">
              <AlarmReport />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportSystem;
