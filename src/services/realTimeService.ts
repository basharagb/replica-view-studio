export interface RealTimeUpdate {
  type: 'temperature' | 'alert' | 'status';
  siloId: number;
  timestamp: number;
  data: {
    temperature?: number;
    alertLevel?: 'normal' | 'warning' | 'critical';
    alertMessage?: string;
    status?: 'online' | 'offline' | 'maintenance';
  };
}

export interface RealTimeSubscription {
  id: string;
  silos: number[];
  callback: (update: RealTimeUpdate) => void;
  active: boolean;
}

class RealTimeService {
  private static instance: RealTimeService;
  private subscriptions: Map<string, RealTimeSubscription> = new Map();
  private simulationInterval: NodeJS.Timeout | null = null;
  private isSimulating: boolean = false;
  private updateFrequency: number = 30000; // 30 seconds default

  public static getInstance(): RealTimeService {
    if (!RealTimeService.instance) {
      RealTimeService.instance = new RealTimeService();
    }
    return RealTimeService.instance;
  }

  /**
   * Subscribe to real-time updates for specific silos
   */
  subscribe(
    silos: number[],
    callback: (update: RealTimeUpdate) => void,
    options: {
      frequency?: number; // Update frequency in milliseconds
      types?: Array<'temperature' | 'alert' | 'status'>;
    } = {}
  ): string {
    const subscriptionId = this.generateSubscriptionId();
    
    const subscription: RealTimeSubscription = {
      id: subscriptionId,
      silos,
      callback,
      active: true
    };

    this.subscriptions.set(subscriptionId, subscription);

    // Start simulation if this is the first subscription
    if (this.subscriptions.size === 1) {
      this.startSimulation(options.frequency || this.updateFrequency);
    }

    return subscriptionId;
  }

  /**
   * Unsubscribe from real-time updates
   */
  unsubscribe(subscriptionId: string): void {
    this.subscriptions.delete(subscriptionId);

    // Stop simulation if no active subscriptions
    if (this.subscriptions.size === 0) {
      this.stopSimulation();
    }
  }

  /**
   * Update subscription frequency
   */
  setUpdateFrequency(frequency: number): void {
    this.updateFrequency = frequency;
    
    if (this.isSimulating) {
      this.stopSimulation();
      this.startSimulation(frequency);
    }
  }

  /**
   * Get all active subscriptions
   */
  getActiveSubscriptions(): RealTimeSubscription[] {
    return Array.from(this.subscriptions.values()).filter(sub => sub.active);
  }

  /**
   * Pause a specific subscription
   */
  pauseSubscription(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.active = false;
    }
  }

  /**
   * Resume a specific subscription
   */
  resumeSubscription(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.active = true;
    }
  }

  /**
   * Start real-time simulation
   */
  private startSimulation(frequency: number): void {
    if (this.isSimulating) {
      this.stopSimulation();
    }

    this.isSimulating = true;
    this.simulationInterval = setInterval(() => {
      this.generateAndBroadcastUpdates();
    }, frequency);

    console.log(`Real-time simulation started with ${frequency}ms frequency`);
  }

  /**
   * Stop real-time simulation
   */
  private stopSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    this.isSimulating = false;
    console.log('Real-time simulation stopped');
  }

  /**
   * Generate and broadcast updates to all active subscriptions
   */
  private generateAndBroadcastUpdates(): void {
    const activeSubscriptions = this.getActiveSubscriptions();
    
    if (activeSubscriptions.length === 0) {
      return;
    }

    // Get all unique silos from active subscriptions
    const allSilos = new Set<number>();
    activeSubscriptions.forEach(sub => {
      sub.silos.forEach(silo => allSilos.add(silo));
    });

    // Generate updates for each silo
    Array.from(allSilos).forEach(siloId => {
      const updates = this.generateUpdatesForSilo(siloId);
      
      // Broadcast to relevant subscriptions
      activeSubscriptions.forEach(subscription => {
        if (subscription.silos.includes(siloId)) {
          updates.forEach(update => {
            try {
              subscription.callback(update);
            } catch (error) {
              console.error(`Error in subscription callback for ${subscription.id}:`, error);
            }
          });
        }
      });
    });
  }

  /**
   * Generate realistic updates for a specific silo
   */
  private generateUpdatesForSilo(siloId: number): RealTimeUpdate[] {
    const updates: RealTimeUpdate[] = [];
    const now = Date.now();

    // Generate temperature update (always)
    const baseTemp = 25 + (siloId % 10) * 2; // Base temperature varies by silo
    const tempVariation = (Math.random() - 0.5) * 10; // ±5°C variation
    const currentTemp = Math.max(15, Math.min(50, baseTemp + tempVariation));

    updates.push({
      type: 'temperature',
      siloId,
      timestamp: now,
      data: {
        temperature: parseFloat(currentTemp.toFixed(1))
      }
    });

    // Generate alert update (15% chance)
    if (Math.random() < 0.15) {
      let alertLevel: 'normal' | 'warning' | 'critical' = 'normal';
      let alertMessage = '';

      if (currentTemp > 40) {
        alertLevel = 'critical';
        alertMessage = `Critical temperature: ${currentTemp.toFixed(1)}°C`;
      } else if (currentTemp > 30) {
        alertLevel = 'warning';
        alertMessage = `High temperature warning: ${currentTemp.toFixed(1)}°C`;
      } else if (Math.random() < 0.3) {
        alertLevel = 'warning';
        alertMessage = 'Maintenance required';
      }

      if (alertLevel !== 'normal') {
        updates.push({
          type: 'alert',
          siloId,
          timestamp: now,
          data: {
            alertLevel,
            alertMessage,
            temperature: currentTemp
          }
        });
      }
    }

    // Generate status update (5% chance)
    if (Math.random() < 0.05) {
      const statuses: Array<'online' | 'offline' | 'maintenance'> = ['online', 'offline', 'maintenance'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      updates.push({
        type: 'status',
        siloId,
        timestamp: now,
        data: {
          status: randomStatus
        }
      });
    }

    return updates;
  }

  /**
   * Generate unique subscription ID
   */
  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get connection status (simulated)
   */
  getConnectionStatus(): {
    connected: boolean;
    lastUpdate: number;
    subscriptionCount: number;
    updateFrequency: number;
  } {
    return {
      connected: this.isSimulating,
      lastUpdate: Date.now(),
      subscriptionCount: this.subscriptions.size,
      updateFrequency: this.updateFrequency
    };
  }

  /**
   * Simulate connection issues
   */
  simulateConnectionIssue(duration: number = 5000): void {
    console.warn('Simulating connection issue...');
    this.stopSimulation();
    
    setTimeout(() => {
      if (this.subscriptions.size > 0) {
        this.startSimulation(this.updateFrequency);
        console.log('Connection restored');
      }
    }, duration);
  }

  /**
   * Get real-time statistics
   */
  getStatistics(): {
    totalUpdates: number;
    updatesPerMinute: number;
    activeSubscriptions: number;
    averageLatency: number;
  } {
    // This would be implemented with actual metrics in a real application
    return {
      totalUpdates: Math.floor(Math.random() * 10000),
      updatesPerMinute: Math.floor(60000 / this.updateFrequency) * this.subscriptions.size,
      activeSubscriptions: this.subscriptions.size,
      averageLatency: Math.floor(Math.random() * 100) + 50 // 50-150ms simulated latency
    };
  }

  /**
   * Cleanup all subscriptions and stop simulation
   */
  cleanup(): void {
    this.stopSimulation();
    this.subscriptions.clear();
    console.log('RealTimeService cleaned up');
  }
}

export default RealTimeService;
