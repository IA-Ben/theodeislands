/**
 * Environment-aware data loader for development/production pipeline
 */

import productionData from '@/app/data/ode-islands.json';

// Type definition for our chapter data structure
type ChapterData = {
  [key: string]: any[];
};

// Dynamic import for development data to avoid bundling in production
const loadDevelopmentData = async (): Promise<ChapterData> => {
  try {
    const devData = await import('@/app/data/ode-islands.dev.json');
    return devData.default as ChapterData;
  } catch (error) {
    console.warn('Development data not found, falling back to production data');
    return productionData as ChapterData;
  }
};

/**
 * Load the appropriate data based on environment
 */
export async function getOdeIslandsData(): Promise<ChapterData> {
  const isDevelopment = process.env.NODE_ENV === 'development' ||
                       process.env.VERCEL_ENV === 'preview' ||
                       process.env.NEXT_PUBLIC_DEV_MODE === 'true';

  if (isDevelopment) {
    return await loadDevelopmentData();
  }

  return productionData as ChapterData;
}

/**
 * Get data for a specific chapter
 */
export async function getChapterData(chapter: string) {
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