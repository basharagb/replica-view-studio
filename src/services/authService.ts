export interface User {
  id: number;
  username: string;
  role: 'admin' | 'technician' | 'operator';
  permissions?: string[];
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token?: string;
    user: User;
  };
}

export interface ApiLoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: number;
      username: string;
      email?: string;
      role: string;
    };
  };
  timestamp: string;
}

export interface DecodedToken {
  id: number;
  username: string;
  role: string;
  permissions: string[];
  exp: number;
}

import { Strings } from '../utils/Strings';

const API_BASE_URL = Strings.BASE_URL;

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
      
      const apiData = await response.json();
      console.log('Login response data:', apiData);
      
      if (!response.ok) {
        return {
          success: false,
          message: apiData.message || 'Login failed',
        };
      }

      // Handle the actual API response format: {message: "Login successful", user: {...}}
      if (!apiData.user) {
        return {
          success: false,
          message: 'Invalid response format',
        };
      }

      // Transform API response to match expected LoginResponse structure
      const user: User = {
        id: apiData.user.id,
        username: apiData.user.username,
        role: apiData.user.role as 'admin' | 'technician' | 'operator',
        permissions: AuthService.getRolePermissions(apiData.user.role)
      };

      // Generate a session token since API doesn't provide one
      const token = AuthService.generateSessionToken(user);

      return {
        success: true,
        message: apiData.message || 'Login successful',
        data: {
          token,
          user
        }
      };
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
      // Handle JWT tokens (format: header.payload.signature)
      if (token.includes('.')) {
        const parts = token.split('.');
        if (parts.length === 3) {
          // Decode JWT payload (second part)
          const payload = JSON.parse(atob(parts[1]));
          return {
            id: payload.id,
            username: payload.username,
            role: payload.role,
            permissions: AuthService.getRolePermissions(payload.role),
            exp: payload.exp
          };
        }
      }
      
      // Fallback to simple base64 decoding for backward compatibility
      const decoded = JSON.parse(atob(token));
      return decoded;
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  }

  static validateToken(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded) return false;
    
    // Check if token is not expired (current time in seconds should be less than expiration)
    return Math.floor(Date.now() / 1000) < decoded.exp;
  }

  // Alias for backward compatibility
  static isTokenValid(token: string): boolean {
    return this.validateToken(token);
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
      '/maintenance-panel': 'maintenance',
      '/settings': 'settings'
    };

    const requiredPermission = sectionPermissionMap[section];
    if (!requiredPermission) return false;

    return this.hasPermission(userPermissions, requiredPermission);
  }

  static getRolePermissions(role: string): string[] {
    const rolePermissions: Record<string, string[]> = {
      admin: ['all'], // Full access
      technician: ['live_readings', 'alerts_monitoring', 'reports', 'maintenance'],
      operator: ['live_readings', 'alerts_monitoring', 'reports']
    };
    
    return rolePermissions[role] || ['live_readings'];
  }

  static generateSessionToken(user: User): string {
    // Generate a simple session token (base64 encoded user data with timestamp)
    const tokenData = {
      id: user.id,
      username: user.username,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours from now
    };
    
    // Use browser-compatible base64 encoding
    return btoa(JSON.stringify(tokenData));
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
