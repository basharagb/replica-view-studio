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
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDark } = useTheme();
  const { login } = useAuth();

  const [loginOpen, setLoginOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [pendingSection, setPendingSection] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigation = [
    { name: 'Live Readings', href: '/', icon: Activity, description: 'Real-time silo monitoring and readings' },
    { name: 'Alerts Monitoring', href: '/monitoring', icon: Thermometer, description: 'Advanced silo temperature monitoring system' },
    { name: 'Reports', href: '/reports', icon: FileText, description: 'Readings history and analytics' },
    { name: 'Maintenance', href: '/analytics', icon: BarChart3, description: 'Maintenance and system health' },
    { name: 'Settings', href: '/settings', icon: Settings, description: 'System configuration' }
  ];

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
        <div
          className={`flex items-center justify-between h-16 px-6 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <h1
            className={`text-xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            Silo Monitor
          </h1>
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
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={(e) => {
                  if (item.name === 'Maintenance' || item.name === 'Settings') {
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
              onSubmit={(e) => {
                e.preventDefault();
                setLoading(true);
                setTimeout(() => {
                  login('dummy-token');
                  setLoading(false);
                  setLoginOpen(false);
                  if (pendingHref) navigate(pendingHref, { replace: true });
                }, 400);
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="dlg-email" className="text-sm text-gray-700">User name</Label>
                <Input
                  id="dlg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md mt-4 transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Login</span>
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
