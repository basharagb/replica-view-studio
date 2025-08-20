import React, { useState } from 'react';
import { MaintenanceLabInterface } from './MaintenanceLabInterface';
import { MaintenanceCablePopup } from './MaintenanceCablePopup';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Cable, Wrench, TestTube, Zap, Activity, AlertCircle, CheckCircle, Wifi, Send } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { sendSMS } from '../services/smsService';

export const MaintenanceInterface = () => {
  const [showCablePopup, setShowCablePopup] = useState(false);
  const [selectedSiloForPopup, setSelectedSiloForPopup] = useState<number | null>(null);
  const [testingSilo, setTestingSilo] = useState<number | null>(null);
  const [manualSiloInput, setManualSiloInput] = useState<string>('');
  const { toast } = useToast();
  const [smsPhone, setSmsPhone] = useState<string>('+962');
  const [smsMessage, setSmsMessage] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);

  const handleSiloClick = (siloNumber: number) => {
    // Start manual test
    setTestingSilo(siloNumber);
    
    // Show cable popup after a brief delay
    setTimeout(() => {
      setSelectedSiloForPopup(siloNumber);
      setShowCablePopup(true);
      setTestingSilo(null);
    }, 1000);
  };

  const handleCloseCablePopup = () => {
    setShowCablePopup(false);
    setSelectedSiloForPopup(null);
  };

  const handleManualTest = () => {
    const siloNumber = parseInt(manualSiloInput);
    if (!isNaN(siloNumber) && siloNumber > 0) {
      handleSiloClick(siloNumber);
    }
  };

  const handleSendSMS = async () => {
    if (!smsPhone || !smsPhone.startsWith('+')) {
      toast({ title: 'Invalid phone number', description: 'Use E.164 format, e.g. +96279...', variant: 'destructive' });
      return;
    }
    if (!smsMessage || smsMessage.trim().length === 0) {
      toast({ title: 'Message required', description: 'Please enter an SMS message to send.', variant: 'destructive' });
      return;
    }
    setSending(true);
    const payload = { to: smsPhone.trim(), message: smsMessage.trim() };
    const result = await sendSMS(payload);
    setSending(false);
    if (result.ok) {
      toast({ title: 'SMS sent', description: 'Your message was accepted by the SMS service.' });
    } else {
      toast({ title: 'Failed to send SMS', description: result.error || `Status ${result.status}`, variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* System Status Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-lg">
              <Cable className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Cable Maintenance System</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Click any silo to test cables and sensors</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              System Online
            </Badge>
            {testingSilo && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                <TestTube className="h-3 w-3 mr-1" />
                Testing Silo {testingSilo}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col gap-6">
        {/* Silo Interface */}
        <div className="flex-1">
          <MaintenanceLabInterface onSiloClick={handleSiloClick} />
        </div>
      </div>

      {/* Actions Row Under Silos */}
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Manual Test */}
          <Card className="bg-white dark:bg-gray-800 border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Wrench className="h-4 w-4" /> Manual Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Silo #"
                  value={manualSiloInput}
                  onChange={(e) => setManualSiloInput(e.target.value)}
                />
                <Button size="sm" onClick={handleManualTest}>Test</Button>
              </div>
              {selectedSiloForPopup && (
                <p className="text-xs text-gray-500">Last tested: Silo {selectedSiloForPopup}</p>
              )}
            </CardContent>
          </Card>

          {/* Send SMS */}
          <Card className="bg-white dark:bg-gray-800 border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="h-4 w-4" /> Send SMS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Recipient phone (e.g. +962790123456)"
                value={smsPhone}
                onChange={(e) => setSmsPhone(e.target.value)}
              />
              <Textarea
                placeholder="Type your message"
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                rows={4}
              />
              <Button className="w-full" onClick={handleSendSMS} disabled={sending}>
                {sending ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-pulse" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" /> Send SMS
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cable Connection Cards - Horizontal Panel Under Silos */}
      <div className="w-full">
        <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Cable className="h-6 w-6 text-green-600" />
              Cable Connection Overview
              <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-200">
                <Activity className="h-3 w-3 mr-1" />
                Live Status
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Cable Connection Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
              {/* Circular Silo Cable Card */}
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-700 hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-lg">
                        <Cable className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-semibold text-blue-900 dark:text-blue-100">Circular Silos</span>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Silo Range:</span>
                      <span className="font-medium text-blue-700 dark:text-blue-300">Odd Numbers</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Cables per Silo:</span>
                      <span className="font-medium text-blue-700 dark:text-blue-300">2</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Sensors per Cable:</span>
                      <span className="font-medium text-blue-700 dark:text-blue-300">8</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600 dark:text-gray-300">Total Sensors:</span>
                      <span className="font-bold text-blue-800 dark:text-blue-200">16</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Square Silo Cable Card */}
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700 hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-purple-100 dark:bg-purple-800 p-2 rounded-lg">
                        <Cable className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="font-semibold text-purple-900 dark:text-purple-100">Square Silos</span>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Silo Range:</span>
                      <span className="font-medium text-purple-700 dark:text-purple-300">Even Numbers</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Cables per Silo:</span>
                      <span className="font-medium text-purple-700 dark:text-purple-300">1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Sensors per Cable:</span>
                      <span className="font-medium text-purple-700 dark:text-purple-300">8</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600 dark:text-gray-300">Total Sensors:</span>
                      <span className="font-bold text-purple-800 dark:text-purple-200">8</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Status Card */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 dark:bg-green-800 p-2 rounded-lg">
                        <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="font-semibold text-green-900 dark:text-green-100">System Status</span>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Total Cables:</span>
                      <span className="font-medium text-green-700 dark:text-green-300">150+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Active Sensors:</span>
                      <span className="font-medium text-green-700 dark:text-green-300">1200+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Test Mode:</span>
                      <span className="font-medium text-green-700 dark:text-green-300">Manual</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600 dark:text-gray-300">Status:</span>
                      <span className="font-bold text-green-800 dark:text-green-200">Online</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Test Status Card */}
              <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border border-orange-200 dark:border-orange-700 hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-orange-100 dark:bg-orange-800 p-2 rounded-lg">
                        <TestTube className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <span className="font-semibold text-orange-900 dark:text-orange-100">Test Status</span>
                    </div>
                    {testingSilo ? (
                      <Zap className="h-5 w-5 text-yellow-500 animate-pulse" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Current Test:</span>
                      <span className="font-medium text-orange-700 dark:text-orange-300">
                        {testingSilo ? `Silo ${testingSilo}` : 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Last Tested:</span>
                      <span className="font-medium text-orange-700 dark:text-orange-300">
                        {selectedSiloForPopup ? `Silo ${selectedSiloForPopup}` : 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Mode:</span>
                      <span className="font-medium text-orange-700 dark:text-orange-300">Manual</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600 dark:text-gray-300">Status:</span>
                      <span className="font-bold text-orange-800 dark:text-orange-200">
                        {testingSilo ? 'Testing' : 'Ready'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sensor Details Panel - Horizontal Layout */}
            {selectedSiloForPopup && (
              <Card className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 border border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-slate-600" />
                    Silo {selectedSiloForPopup} - Sensor Details
                    <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                      {selectedSiloForPopup >= 1 && selectedSiloForPopup <= 61 ? 'Circular' : 'Square'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Cable 0 Sensors */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                        <Cable className="h-4 w-4" />
                        Cable 0
                      </h4>
                      <div className="space-y-1">
                        {Array.from({ length: 8 }, (_, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                            <span className="text-sm font-medium">S{i + 1}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-gray-600 dark:text-gray-400">Active</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cable 1 Sensors (only for circular silos) */}
                    {selectedSiloForPopup >= 1 && selectedSiloForPopup <= 61 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                          <Cable className="h-4 w-4" />
                          Cable 1
                        </h4>
                        <div className="space-y-1">
                          {Array.from({ length: 8 }, (_, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                              <span className="text-sm font-medium">S{i + 1}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-gray-600 dark:text-gray-400">Active</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Connection Status */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
                        <Wifi className="h-4 w-4" />
                        Connection
                      </h4>
                      <div className="space-y-1">
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-700">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-700 dark:text-green-300">All Cables Connected</span>
                          </div>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Sensors Responding</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        Quick Actions
                      </h4>
                      <div className="space-y-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => {
                            setSelectedSiloForPopup(selectedSiloForPopup);
                            setShowCablePopup(true);
                          }}
                        >
                          <TestTube className="h-3 w-3 mr-2" />
                          Detailed View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => handleSiloClick(selectedSiloForPopup)}
                        >
                          <Zap className="h-3 w-3 mr-2" />
                          Retest Cables
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cable Popup */}
      {showCablePopup && selectedSiloForPopup && (
        <MaintenanceCablePopup
          siloNumber={selectedSiloForPopup}
          onClose={handleCloseCablePopup}
        />
      )}
    </div>
  );
};
