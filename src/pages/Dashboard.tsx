import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useTheme } from '../contexts/ThemeContext';
import {
  Activity,
  FileText,
  Settings,
  BarChart3,
  Thermometer,
  LogOut,
  User,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import { AuthService } from '../services/authService';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDark } = useTheme();
  const { login, logout, user, canAccessSection, isLoading: authLoading } = useAuth();

  const [loginOpen, setLoginOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [pendingSection, setPendingSection] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const navigation = [
    { name: 'Live Readings', href: '/', icon: Activity, description: 'Real-time silo monitoring and readings', permission: 'live_readings' },
    { name: 'Alerts Monitoring', href: '/monitoring', icon: Thermometer, description: 'Advanced silo temperature monitoring system', permission: 'alerts_monitoring' },
    { name: 'Reports', href: '/reports', icon: FileText, description: 'Readings history and analytics', permission: 'reports' },
    { name: 'Maintenance', href: '/analytics', icon: BarChart3, description: 'Maintenance and system health', permission: 'maintenance' },
    { name: 'Settings', href: '/settings', icon: Settings, description: 'System configuration', permission: 'settings' }
  ];

  // Filter navigation items based on user permissions
  const accessibleNavigation = navigation.filter(item => 
    user ? canAccessSection(item.href) : item.href === '/'
  );

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isDark ? 'bg-gray-800 border-r border-gray-700' : 'bg-white border-r border-gray-200'}`}
      >
        {/* Enhanced Sidebar Header */}
        <div
          className={`px-6 border-b ${
            isDark ? 'border-gray-700 bg-gradient-to-r from-gray-800 to-gray-750' : 'border-gray-200 bg-gradient-to-r from-white to-gray-50'
          }`}
        >
          {/* Title Section */}
          <div className="flex items-center py-4">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isDark ? 'bg-blue-600' : 'bg-blue-500'
              }`}>
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1
                  className={`text-xl font-bold tracking-tight ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Silo Monitor
                </h1>
                <div className={`text-xs font-medium ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  Industrial IoT Platform
                </div>
              </div>
            </div>
          </div>
          
          {/* User Info Section */}
          {user && (
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                  isDark ? 'bg-gray-700/50' : 'bg-gray-100'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    user.role === 'admin' ? 'bg-red-500' : 
                    user.role === 'technician' ? 'bg-orange-500' : 'bg-green-500'
                  }`}>
                    <User className="h-3 w-3 text-white" />
                  </div>
                  <div className={`text-sm font-medium ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    {user.username}
                  </div>
                  <div className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    user.role === 'admin' ? (isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700') :
                    user.role === 'technician' ? (isDark ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-700') :
                    (isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
                  }`}>
                    {AuthService.getUserRoleDisplayName(user.role)}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className={`h-8 w-8 p-0 rounded-full transition-all duration-200 ${
                  isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                }`}
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {/* Sidebar Toggle Button */}
        <div className="absolute -right-3 top-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden"
          >
            ✕
          </Button>
        </div>

        <nav className="mt-6">
          <div className="px-3">
            {accessibleNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={(e) => {
                  // Check if user has permission to access this section
                  if (!user || !canAccessSection(item.href)) {
                    e.preventDefault();
                    setPendingHref(item.href);
                    setPendingSection(item.name);
                    setLoginOpen(true);
                  }
                }}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? isDark
                      ? 'bg-blue-900 text-blue-300 border-r-2 border-blue-500'
                      : 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                    : isDark
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-gray-100'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div
                    className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(true)}
          className={isDark ? 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700' : ''}
        >
          ☰
        </Button>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : ''}`}>
        <div className="min-h-screen">
          <Outlet />
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Login Dialog - Centered */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="sm:max-w-sm p-8 bg-white border-0 shadow-xl rounded-lg flex flex-col justify-center items-center">
          <div className="w-full">
            <DialogHeader className="text-center">
              <DialogTitle className="text-2xl font-normal text-gray-900">
                {pendingSection ? `${pendingSection} Login` : 'Login'}
              </DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                setLoginError('');
                
                try {
                  const response = await login(username, password);
                  
                  if (response.success) {
                    setLoginOpen(false);
                    setUsername('');
                    setPassword('');
                    if (pendingHref) navigate(pendingHref, { replace: true });
                  } else {
                    setLoginError(response.message);
                  }
                } catch (error) {
                  setLoginError('Login failed. Please try again.');
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loginError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {loginError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="dlg-username" className="text-sm text-gray-700">User name</Label>
                <Input
                  id="dlg-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter user name"
                  className="h-11 px-3 text-base border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dlg-password" className="text-sm font-medium text-gray-800">Password</Label>
                <Input
                  id="dlg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="h-11 px-3 text-base border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">
                <strong>Test Users:</strong><br/>
                ahmed/ahmed (Admin), hussein/hussein (Technician), bashar/bashar (Operator)
              </div>
              <Button
                type="submit"
                disabled={loading || authLoading}
                className="w-full h-11 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md mt-4 transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Logging in...</span>
                  </div>
                ) : (
                  'Login'
                )}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
