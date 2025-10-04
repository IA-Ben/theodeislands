/**
 * Manual cache-busting utilities for development team
 */

/**
 * Force clear all cached data and reload from server
 */
export function clearDataCache(): void {
  if (typeof window !== 'undefined') {
    // Clear localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('ode-islands') || key.includes('chapter'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Clear sessionStorage
    const sessionKeysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.includes('ode-islands') || key.includes('chapter'))) {
        sessionKeysToRemove.push(key);
      }
    }
    sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));

    // Force page reload with cache bypass
    window.location.href = `${window.location.pathname}?forceCacheBust=${Date.now()}`;
  }
}

/**
 * Add cache-busting parameter to current URL
 */
export function addCacheBustParam(): void {
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    url.searchParams.set('cacheBust', Date.now().toString());
    window.history.replaceState({}, '', url.toString());
  }
}

/**
 * Check if cache-busting is active
 */
export function isCacheBustingActive(): boolean {
  if (typeof window === 'undefined') return false;

  const url = new URL(window.location.href);
  return url.searchParams.has('cacheBust') ||
         url.searchParams.has('forceCacheBust') ||
         url.searchParams.has('dev');
}

export interface CacheInfo {
  hostname: string;
  isDevelopment: boolean;
  cacheBustingActive: boolean;
  currentUrl: string;
  timestamp: string;
}

/**
 * Display cache status info for debugging
 */
export function getCacheInfo(): CacheInfo {
  if (typeof window === 'undefined') {
    return {
      hostname: 'unknown',
      isDevelopment: false,
      cacheBustingActive: false,
      currentUrl: '',
      timestamp: new Date().toISOString()
    };
  }

  return {
    hostname: window.location.hostname,
    isDevelopment: window.location.hostname === 'localhost' ||
                   window.location.hostname.includes('git-development') ||
                   window.location.search.includes('dev=true'),
    cacheBustingActive: isCacheBustingActive(),
    currentUrl: window.location.href,
    timestamp: new Date().toISOString()
  };
}
