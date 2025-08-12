import { getAlarmedSilos } from './reportService';

export interface AlertedSilo {
  number: number;
  status: 'Critical' | 'Warning';
  lastUpdated: Date;
  searchText: string; // For fast text-based searching
}

export interface SearchResult {
  silos: AlertedSilo[];
  totalCount: number;
  criticalCount: number;
  warningCount: number;
}

class AlertedSiloSearchService {
  private cache: AlertedSilo[] = [];
  private lastCacheUpdate: number = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds
  private searchIndex: Map<string, AlertedSilo[]> = new Map();

  /**
   * Get all alerted silos with caching for fast access
   */
  async getAllAlertedSilos(forceRefresh: boolean = false): Promise<AlertedSilo[]> {
    const now = Date.now();
    
    // Use cache if available and not expired, unless force refresh
    if (!forceRefresh && this.cache.length > 0 && (now - this.lastCacheUpdate) < this.CACHE_DURATION) {
      return this.cache;
    }

    try {
      // Fetch from API
      const apiSilos = await getAlarmedSilos(true);
      
      // Transform to our format - ONLY include Critical alerts, filter out Warning
      this.cache = apiSilos
        .filter(silo => silo.status === 'Critical') // Only show Critical alerts
        .map(silo => ({
          number: silo.number,
          status: silo.status as 'Critical' | 'Warning',
          lastUpdated: new Date(),
          searchText: `silo ${silo.number} ${silo.status.toLowerCase()}`
        }));

      this.lastCacheUpdate = now;
      this.buildSearchIndex();
      
      return this.cache;
    } catch (error) {
      console.error('Error fetching alerted silos:', error);
      return this.cache; // Return cached data if available
    }
  }

  /**
   * Fast search through alerted silos
   */
  async searchAlertedSilos(
    searchTerm: string = '',
    statusFilter?: 'Critical' | 'Warning' | 'All'
  ): Promise<SearchResult> {
    const allSilos = await this.getAllAlertedSilos();
    
    let filteredSilos = allSilos;

    // Apply search term filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filteredSilos = allSilos.filter(silo => 
        silo.searchText.includes(term) ||
        silo.number.toString().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter && statusFilter !== 'All') {
      filteredSilos = filteredSilos.filter(silo => silo.status === statusFilter);
    }

    // Calculate counts
    const criticalCount = filteredSilos.filter(s => s.status === 'Critical').length;
    const warningCount = filteredSilos.filter(s => s.status === 'Warning').length;

    return {
      silos: filteredSilos.sort((a, b) => {
        // Sort by status priority (Critical first), then by silo number
        if (a.status !== b.status) {
          return a.status === 'Critical' ? -1 : 1;
        }
        return a.number - b.number;
      }),
      totalCount: filteredSilos.length,
      criticalCount,
      warningCount
    };
  }

  /**
   * Get quick stats about alerted silos
   */
  async getAlertStats(): Promise<{ total: number; critical: number; warning: number }> {
    const allSilos = await this.getAllAlertedSilos();
    
    return {
      total: allSilos.length,
      critical: allSilos.filter(s => s.status === 'Critical').length,
      warning: allSilos.filter(s => s.status === 'Warning').length
    };
  }

  /**
   * Get alerted silos for dropdown/select components
   */
  async getAlertedSilosForDropdown(): Promise<Array<{
    value: string;
    label: string;
    status: 'Critical' | 'Warning';
    isAlarmed: boolean;
  }>> {
    const allSilos = await this.getAllAlertedSilos();
    
    return allSilos.map(silo => ({
      value: silo.number.toString(),
      label: `Silo ${silo.number} (${silo.status})`,
      status: silo.status,
      isAlarmed: true
    }));
  }

  /**
   * Check if a specific silo is alerted
   */
  async isSiloAlerted(siloNumber: number): Promise<boolean> {
    const allSilos = await this.getAllAlertedSilos();
    return allSilos.some(silo => silo.number === siloNumber);
  }

  /**
   * Get status of a specific silo
   */
  async getSiloStatus(siloNumber: number): Promise<'Critical' | 'Warning' | 'Normal'> {
    const allSilos = await this.getAllAlertedSilos();
    const silo = allSilos.find(s => s.number === siloNumber);
    return silo ? silo.status : 'Normal';
  }

  /**
   * Build search index for faster searching
   */
  private buildSearchIndex(): void {
    this.searchIndex.clear();
    
    this.cache.forEach(silo => {
      // Index by number
      const numberKey = silo.number.toString();
      if (!this.searchIndex.has(numberKey)) {
        this.searchIndex.set(numberKey, []);
      }
      this.searchIndex.get(numberKey)!.push(silo);

      // Index by status
      const statusKey = silo.status.toLowerCase();
      if (!this.searchIndex.has(statusKey)) {
        this.searchIndex.set(statusKey, []);
      }
      this.searchIndex.get(statusKey)!.push(silo);
    });
  }

  /**
   * Clear cache and force refresh
   */
  clearCache(): void {
    this.cache = [];
    this.lastCacheUpdate = 0;
    this.searchIndex.clear();
  }

  /**
   * Get cache status
   */
  getCacheStatus(): {
    isCached: boolean;
    cacheAge: number;
    cacheSize: number;
  } {
    const now = Date.now();
    return {
      isCached: this.cache.length > 0,
      cacheAge: now - this.lastCacheUpdate,
      cacheSize: this.cache.length
    };
  }
}

// Export singleton instance
export const alertedSiloSearchService = new AlertedSiloSearchService();
