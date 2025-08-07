import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useTheme } from '../contexts/ThemeContext';
import {
  Activity,
  FileText,
  Settings,
  BarChart3,
  Database,
  Thermometer
} from 'lucide-react';

const Dashboard = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDark } = useTheme();

  const navigation = [
    { name: 'Live Test', href: '/', icon: Activity, description: 'Real-time silo monitoring and testing' },
    { name: 'Monitoring', href: '/monitoring', icon: Thermometer, description: 'Advanced silo temperature monitoring system' },
    { name: 'Reports', href: '/reports', icon: FileText, description: 'Test history and analytics' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, description: 'Performance metrics and charts' },
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
      <div className={`fixed inset-y-0 left-0 z-50 w-64 shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isDark ? 'bg-gray-800 border-r border-gray-700' : 'bg-white border-r border-gray-200'}`}>
        <div className={`flex items-center justify-between h-16 px-6 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
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
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
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
          <Outlet /> {/* Renders nested routes here */}
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard; 