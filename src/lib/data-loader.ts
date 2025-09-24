/**
 * Environment-aware data loader for development/production pipeline
 */

import productionData from '@/app/data/ode-islands.json';

// Dynamic import for development data to avoid bundling in production
const loadDevelopmentData = async () => {
  try {
    const devData = await import('@/app/data/ode-islands.dev.json');
    return devData.default;
  } catch (error) {
    console.warn('Development data not found, falling back to production data');
    return productionData;
  }
};

/**
 * Load the appropriate data based on environment
 */
export async function getOdeIslandsData() {
  const isDevelopment = process.env.NODE_ENV === 'development' ||
                       process.env.VERCEL_ENV === 'preview' ||
                       process.env.NEXT_PUBLIC_DEV_MODE === 'true';

  if (isDevelopment) {
    return await loadDevelopmentData();
  }

  return productionData;
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