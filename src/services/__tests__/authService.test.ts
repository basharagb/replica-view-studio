import { AuthService } from '../authService';

// Mock fetch globally
global.fetch = jest.fn();

describe('AuthService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      // Mock successful API response
      const mockApiResponse = {
        message: 'Login successful',
        user: {
          id: 1,
          username: 'testuser',
          role: 'admin'
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockApiResponse
      });

      const result = await AuthService.login('testuser', 'password123');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Login successful');
      expect(result.data.user.username).toBe('testuser');
      expect(result.data.user.role).toBe('admin');
      expect(result.data.token).toBeDefined();
      expect(typeof result.data.token).toBe('string');
    });

    it('should handle API errors gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Invalid credentials' })
      });

      const result = await AuthService.login('testuser', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid credentials');
    });

    it('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await AuthService.login('testuser', 'password123');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Network error occurred');
    });
  });

  describe('generateSessionToken', () => {
    it('should generate a valid base64 token', () => {
      const userData = {
        userId: 1,
        username: 'testuser',
        role: 'admin' as const
      };

      const token = AuthService.generateSessionToken(userData);
      
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
      
      // Decode and verify token structure
      const decoded = JSON.parse(atob(token));
      expect(decoded.userId).toBe(1);
      expect(decoded.username).toBe('testuser');
      expect(decoded.role).toBe('admin');
      expect(decoded.exp).toBeDefined();
      expect(typeof decoded.exp).toBe('number');
    });
  });

  describe('getRolePermissions', () => {
    it('should return correct permissions for admin role', () => {
      const permissions = AuthService.getRolePermissions('admin');
      
      expect(permissions).toContain('read');
      expect(permissions).toContain('write');
      expect(permissions).toContain('delete');
      expect(permissions).toContain('admin');
    });

    it('should return correct permissions for technician role', () => {
      const permissions = AuthService.getRolePermissions('technician');
      
      expect(permissions).toContain('read');
      expect(permissions).toContain('write');
      expect(permissions).not.toContain('delete');
      expect(permissions).not.toContain('admin');
    });

    it('should return correct permissions for operator role', () => {
      const permissions = AuthService.getRolePermissions('operator');
      
      expect(permissions).toContain('read');
      expect(permissions).not.toContain('write');
      expect(permissions).not.toContain('delete');
      expect(permissions).not.toContain('admin');
    });
  });

  describe('validateToken', () => {
    it('should validate a valid token', () => {
      const userData = {
        userId: 1,
        username: 'testuser',
        role: 'admin' as const
      };

      const token = AuthService.generateSessionToken(userData);
      const isValid = AuthService.validateToken(token);

      expect(isValid).toBe(true);
    });

    it('should reject an invalid token', () => {
      const invalidToken = 'invalid-token';
      const isValid = AuthService.validateToken(invalidToken);

      expect(isValid).toBe(false);
    });

    it('should reject an expired token', () => {
      // Create a token that's already expired
      const expiredTokenData = {
        userId: 1,
        username: 'testuser',
        role: 'admin',
        exp: Date.now() - 1000 // 1 second ago
      };

      const expiredToken = btoa(JSON.stringify(expiredTokenData));
      const isValid = AuthService.validateToken(expiredToken);

      expect(isValid).toBe(false);
    });
  });

  describe('decodeToken', () => {
    it('should decode a valid token', () => {
      const userData = {
        userId: 1,
        username: 'testuser',
        role: 'admin' as const
      };

      const token = AuthService.generateSessionToken(userData);
      const decoded = AuthService.decodeToken(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(1);
      expect(decoded?.username).toBe('testuser');
      expect(decoded?.role).toBe('admin');
    });

    it('should return null for invalid token', () => {
      const decoded = AuthService.decodeToken('invalid-token');
      expect(decoded).toBeNull();
    });
  });
});
