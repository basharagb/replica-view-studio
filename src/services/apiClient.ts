/**
 * Base API Client for Replica View Studio
 * Handles all HTTP requests, error handling, and response validation
 */

import { 
  API_BASE_URL, 
  APIResponse, 
  APIError, 
  ValidationResult,
  BaseRequestParams,
  SiloNumberRequestParams,
  GroupIdRequestParams
} from '../types/api';

export class APIClient {
  private baseURL: string;
  private defaultTimeout: number = 30000; // 30 seconds

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Validate request parameters
   */
  private validateParams(params: BaseRequestParams): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate start/end timestamps
    if (!params.start || !params.end) {
      errors.push('Start and end timestamps are required');
    }

    // Validate timestamp format (should be hour precision only)
    const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
    if (params.start && !timestampRegex.test(params.start)) {
      errors.push('Start timestamp must be in format YYYY-MM-DDTHH:MM (hour precision only)');
    }
    if (params.end && !timestampRegex.test(params.end)) {
      errors.push('End timestamp must be in format YYYY-MM-DDTHH:MM (hour precision only)');
    }

    // Validate time range
    if (params.start && params.end) {
      const startDate = new Date(params.start);
      const endDate = new Date(params.end);
      
      if (startDate >= endDate) {
        errors.push('Start time must be before end time');
      }

      const diffHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
      if (diffHours > 24 * 24) { // More than 24 days
        warnings.push('Time range exceeds 24 days, consider using smaller ranges for better performance');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate silo-specific parameters
   */
  private validateSiloParams(params: SiloNumberRequestParams): ValidationResult {
    const baseValidation = this.validateParams(params);
    
    if (!params.silo_number || params.silo_number.length === 0) {
      baseValidation.errors.push('At least one silo number is required');
    }

    // Validate silo numbers are positive integers
    if (params.silo_number) {
      params.silo_number.forEach((silo, index) => {
        if (!Number.isInteger(silo) || silo <= 0) {
          baseValidation.errors.push(`Silo number at index ${index} must be a positive integer`);
        }
      });
    }

    return {
      isValid: baseValidation.errors.length === 0,
      errors: baseValidation.errors,
      warnings: baseValidation.warnings
    };
  }

  /**
   * Validate group-specific parameters
   */
  private validateGroupParams(params: GroupIdRequestParams): ValidationResult {
    const baseValidation = this.validateParams(params);
    
    if (!params.group_id || params.group_id.length === 0) {
      baseValidation.errors.push('At least one group ID is required');
    }

    // Validate group IDs are positive integers
    if (params.group_id) {
      params.group_id.forEach((groupId, index) => {
        if (!Number.isInteger(groupId) || groupId <= 0) {
          baseValidation.errors.push(`Group ID at index ${index} must be a positive integer`);
        }
      });
    }

    return {
      isValid: baseValidation.errors.length === 0,
      errors: baseValidation.errors,
      warnings: baseValidation.warnings
    };
  }

  /**
   * Build query string from parameters
   */
  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item.toString()));
      } else if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return searchParams.toString();
  }

  /**
   * Make HTTP request with error handling
   */
  private async makeRequest<T>(
    endpoint: string, 
    params: Record<string, any> = {},
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const queryString = this.buildQueryString(params);
    const url = `${this.baseURL}${endpoint}${queryString ? `?${queryString}` : ''}`;

    console.log(`API Request: ${url}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers
        },
        signal: controller.signal,
        ...options
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData: APIError = {
          success: false,
          error: `HTTP ${response.status}`,
          message: response.statusText || 'Request failed',
          timestamp: new Date().toISOString(),
          status_code: response.status
        };
        throw errorData;
      }

      const data = await response.json();
      
      // Validate response structure
      if (typeof data !== 'object' || data === null) {
        throw new Error('Invalid response format: expected JSON object');
      }

      // If the API doesn't return a structured response, wrap it
      if (!data.hasOwnProperty('success')) {
        return {
          success: true,
          data: data as T,
          timestamp: new Date().toISOString(),
          count: Array.isArray(data) ? data.length : undefined
        };
      }

      return data as APIResponse<T>;

    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw {
            success: false,
            error: 'Request Timeout',
            message: `Request to ${endpoint} timed out after ${this.defaultTimeout}ms`,
            timestamp: new Date().toISOString(),
            status_code: 408
          } as APIError;
        }

        throw {
          success: false,
          error: error.name,
          message: error.message,
          timestamp: new Date().toISOString(),
          status_code: 0
        } as APIError;
      }

      // Re-throw API errors
      throw error;
    }
  }

  /**
   * GET request for silo-based endpoints
   */
  async getSiloData<T>(
    endpoint: string, 
    params: SiloNumberRequestParams
  ): Promise<APIResponse<T>> {
    const validation = this.validateSiloParams(params);
    
    if (!validation.isValid) {
      throw {
        success: false,
        error: 'Validation Error',
        message: validation.errors.join(', '),
        timestamp: new Date().toISOString(),
        status_code: 400
      } as APIError;
    }

    // Log warnings
    if (validation.warnings.length > 0) {
      console.warn('API Request Warnings:', validation.warnings);
    }

    return this.makeRequest<T>(endpoint, params);
  }

  /**
   * GET request for group-based endpoints
   */
  async getGroupData<T>(
    endpoint: string, 
    params: GroupIdRequestParams
  ): Promise<APIResponse<T>> {
    const validation = this.validateGroupParams(params);
    
    if (!validation.isValid) {
      throw {
        success: false,
        error: 'Validation Error',
        message: validation.errors.join(', '),
        timestamp: new Date().toISOString(),
        status_code: 400
      } as APIError;
    }

    // Log warnings
    if (validation.warnings.length > 0) {
      console.warn('API Request Warnings:', validation.warnings);
    }

    return this.makeRequest<T>(endpoint, params);
  }

  /**
   * Generic GET request
   */
  async get<T>(endpoint: string, params: Record<string, any> = {}): Promise<APIResponse<T>> {
    return this.makeRequest<T>(endpoint, params);
  }

  /**
   * Set request timeout
   */
  setTimeout(timeout: number): void {
    this.defaultTimeout = timeout;
  }

  /**
   * Get current base URL
   */
  getBaseURL(): string {
    return this.baseURL;
  }
}

// Export singleton instance
export const apiClient = new APIClient();
