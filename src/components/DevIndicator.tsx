"use client";

import { useState, useEffect } from 'react';

export default function DevIndicator() {
  const [isDev, setIsDev] = useState(false);
  const [environment, setEnvironment] = useState<string>('');

  useEffect(() => {
    const isDevelopment = process.env.NODE_ENV === 'development' ||
                         window.location.hostname.includes('git-development') ||
                         window.location.search.includes('dev=true');

    setIsDev(isDevelopment);

    if (isDevelopment) {
      if (process.env.NODE_ENV === 'development') {
        setEnvironment('Local Dev');
      } else if (window.location.hostname.includes('git-development')) {
        setEnvironment('Preview');
      } else {
        setEnvironment('Dev Mode');
      }
    } else {
      setEnvironment('Production');
    }
  }, []);

  if (!isDev) return null;

  return (
    <div className="fixed top-2 left-2 z-50 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
      🚀 {environment}
    </div>
  );
}