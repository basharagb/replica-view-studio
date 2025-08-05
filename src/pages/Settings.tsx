import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Settings as SettingsIcon,
  Moon,
  Sun,
  Bell,
  Shield,
  Database,
  Monitor,
  Wifi,
  AlertTriangle,
  CheckCircle,
  Save,
  RotateCcw,
  Trash2,
  Download,
  Upload,
  Eye,
  EyeOff,
  Palette,
  Clock,
  Thermometer,
  Zap,
  Globe,
  User,
  Lock,
  Mail,
  Phone
} from 'lucide-react';

interface SettingsData {
  // Theme Settings
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  
  // Notification Settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  alertThreshold: number;
  notificationSound: boolean;
  
  // System Settings
  autoTestInterval: number;
  dataRetentionDays: number;
  maxConcurrentTests: number;
  temperatureUnit: 'celsius' | 'fahrenheit';
  timeFormat: '12h' | '24h';
  
  // Security Settings
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordExpiryDays: number;
  loginAttempts: number;
  
  // Data Settings
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  compressionLevel: 'low' | 'medium' | 'high';
  encryptionEnabled: boolean;
  
  // Display Settings
  showTemperatureGraphs: boolean;
  showStatusIndicators: boolean;
  showTimestamps: boolean;
  compactMode: boolean;
  
  // Network Settings
  connectionTimeout: number;
  retryAttempts: number;
  proxyEnabled: boolean;
  proxyServer: string;
  
  // User Profile
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
}

const Settings = () => {
  const { theme, setTheme, isDark } = useTheme();
  
  const [settings, setSettings] = useState<SettingsData>({
    // Theme Settings
    accentColor: '#3b82f6',
    fontSize: 'medium',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    alertThreshold: 40,
    notificationSound: true,
    
    // System Settings
    autoTestInterval: 60,
    dataRetentionDays: 90,
    maxConcurrentTests: 5,
    temperatureUnit: 'celsius',
    timeFormat: '24h',
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiryDays: 90,
    loginAttempts: 3,
    
    // Data Settings
    autoBackup: true,
    backupFrequency: 'daily',
    compressionLevel: 'medium',
    encryptionEnabled: true,
    
    // Display Settings
    showTemperatureGraphs: true,
    showStatusIndicators: true,
    showTimestamps: true,
    compactMode: false,
    
    // Network Settings
    connectionTimeout: 30,
    retryAttempts: 3,
    proxyEnabled: false,
    proxyServer: '',
    
    // User Profile
    firstName: 'Bashar',
    lastName: 'Zabadani',
    email: 'bashar@idealchip.com',
    phone: '+1 (555) 123-4567',
    role: 'System Administrator',
    department: 'Engineering'
  });

  const [activeTab, setActiveTab] = useState<string>('general');
  const [isSaving, setIsSaving] = useState(false);

  const handleSettingChange = (key: keyof SettingsData, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handleReset = () => {
    // Reset to default values
    setSettings({
      accentColor: '#3b82f6',
      fontSize: 'medium',
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      alertThreshold: 40,
      notificationSound: true,
      autoTestInterval: 60,
      dataRetentionDays: 90,
      maxConcurrentTests: 5,
      temperatureUnit: 'celsius',
      timeFormat: '24h',
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiryDays: 90,
      loginAttempts: 3,
      autoBackup: true,
      backupFrequency: 'daily',
      compressionLevel: 'medium',
      encryptionEnabled: true,
      showTemperatureGraphs: true,
      showStatusIndicators: true,
      showTimestamps: true,
      compactMode: false,
      connectionTimeout: 30,
      retryAttempts: 3,
      proxyEnabled: false,
      proxyServer: '',
      firstName: 'Bashar',
      lastName: 'Zabadani',
      email: 'bashar@idealchip.com',
      phone: '+1 (555) 123-4567',
      role: 'System Administrator',
      department: 'Engineering'
    });
  };

  const tabs = [
    { id: 'general', name: 'General', icon: SettingsIcon },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'system', name: 'System', icon: Monitor },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'data', name: 'Data', icon: Database },
    { id: 'network', name: 'Network', icon: Wifi },
    { id: 'profile', name: 'Profile', icon: User }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">Configure your system preferences and account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* General Settings */}
          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Temperature Unit</Label>
                    <Select value={settings.temperatureUnit} onValueChange={(value) => handleSettingChange('temperatureUnit', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="celsius">Celsius (°C)</SelectItem>
                        <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Time Format</Label>
                    <Select value={settings.timeFormat} onValueChange={(value) => handleSettingChange('timeFormat', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12-hour</SelectItem>
                        <SelectItem value="24h">24-hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Auto Test Interval (minutes)</Label>
                    <Select
                      value={settings.autoTestInterval.toString()}
                      onValueChange={(value) => handleSettingChange('autoTestInterval', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select interval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="180">3 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Data Retention (days)</Label>
                    <Input
                      type="number"
                      value={settings.dataRetentionDays}
                      onChange={(e) => handleSettingChange('dataRetentionDays', parseInt(e.target.value))}
                      min="1"
                      max="365"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Theme</Label>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center">
                            <Sun className="h-4 w-4 mr-2" />
                            Light
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center">
                            <Moon className="h-4 w-4 mr-2" />
                            Dark
                          </div>
                        </SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-600 mt-1">
                      Current mode: {isDark ? 'Dark' : 'Light'}
                    </p>
                  </div>
                  <div>
                    <Label>Font Size</Label>
                    <Select value={settings.fontSize} onValueChange={(value) => handleSettingChange('fontSize', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Accent Color</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Input
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => handleSettingChange('accentColor', e.target.value)}
                      className="w-16 h-10"
                    />
                    <span className="text-sm text-gray-600">{settings.accentColor}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Temperature Graphs</Label>
                      <p className="text-sm text-gray-600">Display temperature trend graphs</p>
                    </div>
                    <Switch
                      checked={settings.showTemperatureGraphs}
                      onCheckedChange={(checked) => handleSettingChange('showTemperatureGraphs', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Status Indicators</Label>
                      <p className="text-sm text-gray-600">Display status badges and icons</p>
                    </div>
                    <Switch
                      checked={settings.showStatusIndicators}
                      onCheckedChange={(checked) => handleSettingChange('showStatusIndicators', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Timestamps</Label>
                      <p className="text-sm text-gray-600">Display time information</p>
                    </div>
                    <Switch
                      checked={settings.showTimestamps}
                      onCheckedChange={(checked) => handleSettingChange('showTimestamps', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Compact Mode</Label>
                      <p className="text-sm text-gray-600">Reduce spacing for more content</p>
                    </div>
                    <Switch
                      checked={settings.compactMode}
                      onCheckedChange={(checked) => handleSettingChange('compactMode', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-600">Receive alerts via email</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-gray-600">Receive alerts via SMS</p>
                    </div>
                    <Switch
                      checked={settings.smsNotifications}
                      onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-600">Receive browser notifications</p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notification Sound</Label>
                      <p className="text-sm text-gray-600">Play sound for alerts</p>
                    </div>
                    <Switch
                      checked={settings.notificationSound}
                      onCheckedChange={(checked) => handleSettingChange('notificationSound', checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>Alert Temperature Threshold (°C)</Label>
                  <Input
                    type="number"
                    value={settings.alertThreshold}
                    onChange={(e) => handleSettingChange('alertThreshold', parseInt(e.target.value))}
                    min="0"
                    max="100"
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Receive alerts when temperature exceeds this value
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Settings */}
          {activeTab === 'system' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Max Concurrent Tests</Label>
                    <Input
                      type="number"
                      value={settings.maxConcurrentTests}
                      onChange={(e) => handleSettingChange('maxConcurrentTests', parseInt(e.target.value))}
                      min="1"
                      max="10"
                    />
                  </div>
                  <div>
                    <Label>Session Timeout (minutes)</Label>
                    <Input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                      min="5"
                      max="480"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-600">Add an extra layer of security</p>
                    </div>
                    <Switch
                      checked={settings.twoFactorAuth}
                      onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Data Encryption</Label>
                      <p className="text-sm text-gray-600">Encrypt stored data</p>
                    </div>
                    <Switch
                      checked={settings.encryptionEnabled}
                      onCheckedChange={(checked) => handleSettingChange('encryptionEnabled', checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Password Expiry (days)</Label>
                    <Input
                      type="number"
                      value={settings.passwordExpiryDays}
                      onChange={(e) => handleSettingChange('passwordExpiryDays', parseInt(e.target.value))}
                      min="30"
                      max="365"
                    />
                  </div>
                  <div>
                    <Label>Max Login Attempts</Label>
                    <Input
                      type="number"
                      value={settings.loginAttempts}
                      onChange={(e) => handleSettingChange('loginAttempts', parseInt(e.target.value))}
                      min="3"
                      max="10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Settings */}
          {activeTab === 'data' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto Backup</Label>
                      <p className="text-sm text-gray-600">Automatically backup data</p>
                    </div>
                    <Switch
                      checked={settings.autoBackup}
                      onCheckedChange={(checked) => handleSettingChange('autoBackup', checked)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Backup Frequency</Label>
                    <Select value={settings.backupFrequency} onValueChange={(value) => handleSettingChange('backupFrequency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Compression Level</Label>
                    <Select value={settings.compressionLevel} onValueChange={(value) => handleSettingChange('compressionLevel', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Network Settings */}
          {activeTab === 'network' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5" />
                  Network Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Connection Timeout (seconds)</Label>
                    <Input
                      type="number"
                      value={settings.connectionTimeout}
                      onChange={(e) => handleSettingChange('connectionTimeout', parseInt(e.target.value))}
                      min="5"
                      max="120"
                    />
                  </div>
                  <div>
                    <Label>Retry Attempts</Label>
                    <Input
                      type="number"
                      value={settings.retryAttempts}
                      onChange={(e) => handleSettingChange('retryAttempts', parseInt(e.target.value))}
                      min="1"
                      max="10"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Use Proxy</Label>
                      <p className="text-sm text-gray-600">Connect through proxy server</p>
                    </div>
                    <Switch
                      checked={settings.proxyEnabled}
                      onCheckedChange={(checked) => handleSettingChange('proxyEnabled', checked)}
                    />
                  </div>
                  
                  {settings.proxyEnabled && (
                    <div>
                      <Label>Proxy Server</Label>
                      <Input
                        value={settings.proxyServer}
                        onChange={(e) => handleSettingChange('proxyServer', e.target.value)}
                        placeholder="proxy.example.com:8080"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      value={settings.firstName}
                      onChange={(e) => handleSettingChange('firstName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      value={settings.lastName}
                      onChange={(e) => handleSettingChange('lastName', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={settings.email}
                      onChange={(e) => handleSettingChange('email', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={settings.phone}
                      onChange={(e) => handleSettingChange('phone', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Role</Label>
                    <Input
                      value={settings.role}
                      onChange={(e) => handleSettingChange('role', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Department</Label>
                    <Input
                      value={settings.department}
                      onChange={(e) => handleSettingChange('department', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end space-x-4">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default Settings; 