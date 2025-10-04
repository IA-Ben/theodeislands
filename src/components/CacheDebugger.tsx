'use client';

import { useState, useEffect } from 'react';
import { clearDataCache, getCacheInfo, type CacheInfo } from '@/lib/cache-buster';
import { featureFlags } from '@/lib/feature-flags';

const DEFAULT_CACHE_INFO: CacheInfo = {
  hostname: 'unknown',
  isDevelopment: false,
  cacheBustingActive: false,
  currentUrl: '',
  timestamp: new Date().toISOString()
};

export default function CacheDebugger() {
  const [isVisible, setIsVisible] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<CacheInfo>(DEFAULT_CACHE_INFO);
  const [isClient, setIsClient] = useState(false);
  const [isDemoEnabled, setIsDemoEnabled] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      // Show debug panel in development or when ?debug=cache is present
      const shouldShow = window.location.hostname === 'localhost' ||
                        window.location.hostname.includes('git-development') ||
                        window.location.search.includes('debug=cache');
      setIsVisible(shouldShow);
      setCacheInfo(getCacheInfo());

      // Check current demo status
      setIsDemoEnabled(featureFlags.isDemoEnabled());
    }
  }, []);

  const refreshCacheInfo = () => {
    setCacheInfo(getCacheInfo());
    setIsDemoEnabled(featureFlags.isDemoEnabled());
  };

  const toggleDemoMode = () => {
    if (typeof window !== 'undefined') {
      const newState = !isDemoEnabled;
      // Store in localStorage to persist across reloads
      localStorage.setItem('DEMO_ENABLED_OVERRIDE', newState.toString());
      setIsDemoEnabled(newState);
      // Reload to apply changes
      window.location.reload();
    }
  };

  const handleClearCache = () => {
    clearDataCache();
  };

  const handleHardRefresh = () => {
    if (typeof window !== 'undefined') {
      // Force browser cache clear
      window.location.reload();
    }
  };

  if (!isClient || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-black/90 text-white p-4 rounded-lg shadow-lg text-xs font-mono">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-green-400">Cache Debug</h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Environment:</span>
            <span className={cacheInfo.isDevelopment ? 'text-yellow-400' : 'text-blue-400'}>
              {cacheInfo.isDevelopment ? 'DEV' : 'PROD'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Cache Busting:</span>
            <span className={cacheInfo.cacheBustingActive ? 'text-green-400' : 'text-red-400'}>
              {cacheInfo.cacheBustingActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Demo Mode:</span>
            <span className={isDemoEnabled ? 'text-green-400' : 'text-red-400'}>
              {isDemoEnabled ? 'ENABLED' : 'DISABLED'}
            </span>
          </div>

          <div className="text-gray-400 text-[10px] break-all">
            Host: {cacheInfo.hostname}
          </div>

          <div className="text-gray-400 text-[10px]">
            Updated: {cacheInfo.timestamp}
          </div>
        </div>

        <div className="space-y-1">
          <button
            onClick={toggleDemoMode}
            className={`w-full px-2 py-1 rounded text-[10px] font-bold ${
              isDemoEnabled
                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            🎭 {isDemoEnabled ? 'DISABLE DEMO' : 'ENABLE DEMO'}
          </button>

          <button
            onClick={handleClearCache}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-[10px] font-bold"
          >
            🗑️ CLEAR CACHE & RELOAD
          </button>

          <button
            onClick={handleHardRefresh}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-[10px] font-bold"
          >
            🔄 HARD REFRESH
          </button>

          <button
            onClick={refreshCacheInfo}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-[10px] font-bold"
          >
            ℹ️ REFRESH INFO
          </button>
        </div>

        <div className="mt-2 text-[9px] text-gray-500 border-t border-gray-700 pt-2">
          <strong>Team Instructions:</strong><br/>
          • Add ?debug=cache to URL to show this panel<br/>
          • Add ?dev=true to force development mode<br/>
          • Use "ENABLE DEMO" to activate presenter mode<br/>
          • Use "CLEAR CACHE" if updates are not showing<br/>
          • Demo: Press Shift+D when enabled
        </div>
      </div>
    </div>
  );
}
