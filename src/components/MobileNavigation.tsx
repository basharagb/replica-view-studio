import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Home, 
  Activity, 
  BarChart3, 
  Settings, 
  FileText,
  Thermometer,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { Button } from './ui/button';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: number;
  active?: boolean;
}

interface MobileNavigationProps {
  items?: NavigationItem[];
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
  className?: string;
}

const defaultNavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Home className="w-5 h-5" />,
    active: true
  },
  {
    id: 'monitoring',
    label: 'Live Monitoring',
    icon: <Activity className="w-5 h-5" />,
    badge: 3
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <TrendingUp className="w-5 h-5" />
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: <FileText className="w-5 h-5" />
  },
  {
    id: 'temperature',
    label: 'Temperature',
    icon: <Thermometer className="w-5 h-5" />
  },
  {
    id: 'alerts',
    label: 'Alerts',
    icon: <AlertTriangle className="w-5 h-5" />,
    badge: 5
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="w-5 h-5" />
  }
];

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  items = defaultNavigationItems,
  activeItem,
  onItemClick,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.mobile-nav-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handle item click
  const handleItemClick = (item: NavigationItem) => {
    if (item.onClick) {
      item.onClick();
    }
    if (onItemClick) {
      onItemClick(item.id);
    }
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // Prevent body scroll when menu is open on mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isOpen]);

  if (!isMobile) {
    // Desktop sidebar
    return (
      <nav className={`desktop-nav ${className}`}>
        <div className="w-64 h-full bg-white border-r border-gray-200 shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Silo Monitor</h2>
            <div className="space-y-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200
                    ${activeItem === item.id || item.active
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Mobile navigation
  return (
    <div className={`mobile-nav-container ${className}`}>
      {/* Mobile Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Silo Monitor</h1>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="ghost"
          size="sm"
          className="p-2"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-6 h-6" />
        </Button>
      </header>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 overflow-y-auto"
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Navigation</h2>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="p-2"
                aria-label="Close navigation menu"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-2">
              {items.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleItemClick(item)}
                  className={`
                    w-full flex items-center gap-4 px-4 py-4 rounded-lg text-left transition-all duration-200
                    touch-friendly
                    ${activeItem === item.id || item.active
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100'
                    }
                  `}
                >
                  <div className="flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-base">{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 && (
                    <div className="flex-shrink-0">
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[24px] text-center">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Menu Footer */}
            <div className="mt-auto p-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 text-center">
                Silo Monitoring System v2.0
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Bottom Tab Bar for Mobile (Alternative Navigation) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 md:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {items.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`
                flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200
                touch-friendly min-w-[60px]
                ${activeItem === item.id || item.active
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 active:bg-gray-100'
                }
              `}
            >
              <div className="relative">
                {React.cloneElement(item.icon as React.ReactElement, {
                  className: 'w-5 h-5'
                })}
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium truncate max-w-[50px]">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileNavigation;
