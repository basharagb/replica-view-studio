import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { SiloReport } from './SiloReport';
import { AlarmReport } from './AlarmReport';

export const ReportSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState('silo-report');

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Report System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="silo-report">Silo Report</TabsTrigger>
              <TabsTrigger value="alarm-report">Alarm Report</TabsTrigger>
            </TabsList>
            
            <TabsContent value="silo-report" className="mt-6">
              <SiloReport />
            </TabsContent>
            
            <TabsContent value="alarm-report" className="mt-6">
              <AlarmReport />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
