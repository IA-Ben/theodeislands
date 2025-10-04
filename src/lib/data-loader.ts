/**
 * Environment-aware data loader with cache-busting for development/production pipeline
 */

import productionData from '@/app/data/ode-islands.json';

// Type definition for our chapter data structure
type ChapterData = Record<string, CardData[]>;

// Cache for storing fetched data with timestamps
const dataCache = new Map<string, { data: ChapterData; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds cache for development

/**
 * Generate cache-busting timestamp
 */
const getCacheBuster = (): string => {
  // In development, use current timestamp to always bypass cache
  if (typeof window !== 'undefined') {
    const isDev = window.location.hostname === 'localhost' ||
                  window.location.hostname.includes('git-development') ||
                  window.location.search.includes('dev=true');
    if (isDev) {
      return `?v=${Date.now()}`;
    }
  }

  // In production, use build timestamp (updated on each deployment)
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME || Date.now().toString();
  return `?v=${buildTime}`;
};

/**
 * Fetch JSON data with cache-busting
 */
const fetchJSONData = async (filename: string): Promise<ChapterData> => {
  const cacheBuster = getCacheBuster();
  const url = `/data/${filename}${cacheBuster}`;

  // Check if we have recent cached data (only for production)
  if (!cacheBuster.includes(Date.now().toString())) {
    const cached = dataCache.get(filename);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log(`📦 Using cached data for ${filename}`);
      return cached.data;
    }
  }

  try {
    console.log(`🔄 Fetching fresh data: ${url}`);
    const response = await fetch(url, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as ChapterData;

    // Cache the data
    dataCache.set(filename, { data, timestamp: Date.now() });
    console.log(`✅ Successfully loaded ${filename} with cache-buster`);

    return data;
  } catch (error) {
    console.error(`❌ Failed to fetch ${filename}:`, error);
    throw error;
  }
};

// Dynamic import for development data with cache-busting fallback
const loadDevelopmentData = async (): Promise<ChapterData> => {
  // First try cache-busted fetch from public folder
  try {
    return await fetchJSONData('ode-islands.dev.json');
  } catch (fetchError) {
    console.warn('Cache-busted fetch failed, trying static import fallback', fetchError);

    // Fallback to static import
    try {
      const devData = await import('@/app/data/ode-islands.dev.json');
      return devData.default as ChapterData;
    } catch (importError) {
      console.warn('Development data not found, falling back to production data', importError);
      return productionData as ChapterData;
    }
  }
};

/**
 * Load production data with cache-busting
 */
const loadProductionData = async (): Promise<ChapterData> => {
  // Try cache-busted fetch first
  try {
    return await fetchJSONData('ode-islands.json');
  } catch (error) {
    console.warn('Cache-busted fetch failed, using static import fallback', error);
    return productionData as ChapterData;
  }
};

/**
 * Load the appropriate data based on environment with cache-busting
 */
export async function getOdeIslandsData(): Promise<ChapterData> {
  const isDevelopment = process.env.NODE_ENV === 'development' ||
                       process.env.VERCEL_ENV === 'preview' ||
                       process.env.NEXT_PUBLIC_DEV_MODE === 'true';

  if (isDevelopment) {
    const data = await loadDevelopmentData();
    console.log('🚀 Loaded development data with cache-busting');
    return data;
  }

  const data = await loadProductionData();
  console.log('📱 Loaded production data with cache-busting');
  return data;
}

/**
 * Get data for a specific chapter
 */
export async function getChapterData(chapter: string): Promise<CardData[]> {
  const data = await getOdeIslandsData();
  return data[chapter] || [];
}

/**
 * Environment info for debugging
 */
export function getEnvironmentInfo() {
  return {
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    devMode: process.env.NEXT_PUBLIC_DEV_MODE,
    isDevelopment: process.env.NODE_ENV === 'development' ||
                   process.env.VERCEL_ENV === 'preview' ||
                   process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  };
}
