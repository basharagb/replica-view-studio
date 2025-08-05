import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { SiloReport } from './SiloReport';
import { AlarmReport } from './AlarmReport';

export const ReportSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState('silo-report');

  return (
    <div className="w-full max-w-7xl mx-auto p-6 animate-in fade-in-0 duration-500">
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Report System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg transition-all duration-300">
              <TabsTrigger 
                value="silo-report" 
                className="transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:scale-[0.98]"
              >
                Silo Report
              </TabsTrigger>
              <TabsTrigger 
                value="alarm-report"
                className="transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:scale-[0.98]"
              >
                Alarm Report
              </TabsTrigger>
            </TabsList>
            
            <TabsContent 
              value="silo-report" 
              className="mt-6 animate-in slide-in-from-right-4 fade-in-0 duration-500"
            >
              <SiloReport />
            </TabsContent>
            
            <TabsContent 
              value="alarm-report" 
              className="mt-6 animate-in slide-in-from-left-4 fade-in-0 duration-500"
            >
              <AlarmReport />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
