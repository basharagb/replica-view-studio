export interface User {
  username: string;
  role: 'admin' | 'technician' | 'operator';
  permissions: string[];
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: User;
  };
}

export interface DecodedToken {
  username: string;
  role: string;
  permissions: string[];
  exp: number;
}

const API_BASE_URL = 'http://192.168.1.14:5001';

export class AuthService {
  static async login(username: string, password: string): Promise<LoginResponse> {
    try {
      console.log('Attempting login with:', { username, API_BASE_URL });
      
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('Login response status:', response.status);
      
      const data = await response.json();
      console.log('Login response data:', data);
      
      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Login failed',
        };
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error. Please check if the server is running.',
      };
    }
  }

  static decodeToken(token: string): DecodedToken | null {
    try {
      const decoded = JSON.parse(atob(token));
      return decoded;
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  }

  static isTokenValid(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded) return false;
    
    // Check if token is not expired (current time should be less than expiration)
    return Date.now() < decoded.exp;
  }

  static hasPermission(userPermissions: string[], requiredPermission: string): boolean {
    // Admin has all permissions
    if (userPermissions.includes('all')) return true;
    
    // Check specific permission
    return userPermissions.includes(requiredPermission);
  }

  static canAccessSection(userPermissions: string[], section: string): boolean {
    const sectionPermissionMap: Record<string, string> = {
      '/': 'live_readings',
      '/monitoring': 'alerts_monitoring', 
      '/reports': 'reports',
      '/analytics': 'maintenance',
      '/settings': 'settings'
    };

    const requiredPermission = sectionPermissionMap[section];
    if (!requiredPermission) return false;

    return this.hasPermission(userPermissions, requiredPermission);
  }

  static getUserRoleDisplayName(role: string): string {
    const roleNames: Record<string, string> = {
      admin: 'Administrator',
      technician: 'Technician',
      operator: 'Operator'
    };
    
    return roleNames[role] || role;
  }

  static getAccessibleSections(userPermissions: string[]): string[] {
    const allSections = [
      { path: '/', permission: 'live_readings' },
      { path: '/monitoring', permission: 'alerts_monitoring' },
      { path: '/reports', permission: 'reports' },
      { path: '/analytics', permission: 'maintenance' },
      { path: '/settings', permission: 'settings' }
    ];

    return allSections
      .filter(section => this.hasPermission(userPermissions, section.permission))
      .map(section => section.path);
  }
}
