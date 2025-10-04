/**
 * Feature Flag System for Demo Mode
 * Based on Codex's recommendations for production guards and tree-shaking
 */

export interface FeatureFlags {
  aiFeed: {
    enabled: boolean;
    modelHook: boolean;
  };
  demo: {
    enabled: boolean;
    latencyMs: number;
  };
  afterRecap: {
    enabled: boolean;
  };
  venueCards: {
    enabled: boolean;
  };
  merchCards: {
    enabled: boolean;
  };
  assetUploader: {
    enabled: boolean;
  };
}

// Default flags from demo pack
const DEFAULT_FLAGS: FeatureFlags = {
  aiFeed: {
    enabled: true,
    modelHook: false
  },
  demo: {
    enabled: true,
    latencyMs: 200
  },
  afterRecap: {
    enabled: true
  },
  venueCards: {
    enabled: true
  },
  merchCards: {
    enabled: true
  },
  assetUploader: {
    enabled: true
  }
};

class FeatureFlagManager {
  private flags: FeatureFlags;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.flags = DEFAULT_FLAGS;
    this.loadFlags();
  }

  private getValue(path: string): unknown {
    return path.split('.').reduce<unknown>((current, key) => {
      if (current && typeof current === 'object') {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, this.flags as unknown);
  }

  /**
   * Load feature flags with production safety
   */
  private async loadFlags(): Promise<void> {
    try {
      // In production, demo features should be explicitly enabled
      if (this.isProduction) {
        const isDemoEnabled = process.env.NEXT_PUBLIC_DEMO_ENABLED === 'true';
        if (!isDemoEnabled) {
          this.flags.demo.enabled = false;
          return;
        }
      }

      // Load from demo pack or API
      const response = await fetch('/demo-assets/ode_islands_demo_pack/configs/feature-flags.json');
      if (response.ok) {
        const loadedFlags = await response.json() as Partial<FeatureFlags>;
        this.flags = { ...this.flags, ...loadedFlags };
      }
    } catch (error) {
      console.warn('Failed to load feature flags:', error);
      // Fallback to defaults
    }
  }

  /**
   * Check if a feature is enabled
   */
  isEnabled(featurePath: string): boolean {
    const value = this.getValue(featurePath);
    if (value === undefined) {
      return false;
    }
    if (typeof value === 'boolean') {
      return value;
    }
    return Boolean(value);
  }

  /**
   * Get feature configuration
   */
  getConfig<T>(featurePath: string): T | null {
    const value = this.getValue(featurePath);
    return value === undefined ? null : (value as T);
  }

  /**
   * Production guard for demo features
   */
  isDemoEnabled(): boolean {
    // Check localStorage override first (for manual toggle)
    if (typeof window !== 'undefined') {
      const override = localStorage.getItem('DEMO_ENABLED_OVERRIDE');
      if (override !== null) {
        return override === 'true';
      }
    }

    if (this.isProduction && process.env.NEXT_PUBLIC_DEMO_ENABLED !== 'true') {
      return false;
    }
    return this.isEnabled('demo.enabled');
  }

  /**
   * Kill switch for emergency disabling
   */
  isKillSwitchActive(): boolean {
    return process.env.NEXT_PUBLIC_DEMO_KILL_SWITCH === 'true';
  }

  /**
   * Tree-shaking helper for production builds
   */
  shouldIncludeDemoBundle(): boolean {
    if (this.isKillSwitchActive()) {
      return false;
    }
    return this.isDemoEnabled();
  }
}

// Singleton instance
export const featureFlags = new FeatureFlagManager();

/**
 * React hook for feature flags
 */
export function useFeatureFlag(featurePath: string): boolean {
  return featureFlags.isEnabled(featurePath);
}

/**
 * React hook for demo mode
 */
export function useDemoMode(): {
  isEnabled: boolean;
  latency: number;
  shouldLoad: boolean;
} {
  const isEnabled = featureFlags.isDemoEnabled();
  const latency = featureFlags.getConfig<number>('demo.latencyMs') ?? 200;
  const shouldLoad = featureFlags.shouldIncludeDemoBundle();

  return {
    isEnabled,
    latency,
    shouldLoad
  };
}

/**
 * Production guard for conditional imports
 */
export async function loadDemoModule<T>(importFn: () => Promise<T>): Promise<T | null> {
  if (!featureFlags.shouldIncludeDemoBundle()) {
    return null;
  }

  try {
    return await importFn();
  } catch (error) {
    console.error('Failed to load demo module:', error);
    return null;
  }
}
