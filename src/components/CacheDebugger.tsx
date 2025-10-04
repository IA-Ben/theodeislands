'use client';

import { useState, useEffect } from 'react';
import { clearDataCache, getCacheInfo, type CacheInfo } from '@/lib/cache-buster';

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

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      // Show debug panel in development or when ?debug=cache is present
      const shouldShow = window.location.hostname === 'localhost' ||
                        window.location.hostname.includes('git-development') ||
                        window.location.search.includes('debug=cache');
      setIsVisible(shouldShow);
      setCacheInfo(getCacheInfo());
    }
  }, []);

  const refreshCacheInfo = () => {
    setCacheInfo(getCacheInfo());
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

          <div className="text-gray-400 text-[10px] break-all">
            Host: {cacheInfo.hostname}
          </div>

          <div className="text-gray-400 text-[10px]">
            Updated: {cacheInfo.timestamp}
          </div>
        </div>

        <div className="space-y-1">
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
          • Use &quot;CLEAR CACHE&quot; if updates are not showing
        </div>
      </div>
    </div>
  );
}
