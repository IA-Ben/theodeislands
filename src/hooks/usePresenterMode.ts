'use client';

import { useState, useEffect } from 'react';

export function usePresenterMode() {
  const [isPresenterMode, setIsPresenterMode] = useState(false);

  // Listen for demo events
  useEffect(() => {
    const handleDemoNavigate = (e: CustomEvent) => {
      console.log('🎭 Demo Navigate:', e.detail);
      // Your app can handle navigation here
      // For example: router.push(`/${e.detail.to}`);
    };

    const handleDemoStep = (e: CustomEvent) => {
      console.log('🎭 Demo Step:', e.detail);
      // Handle specific demo actions
      const { action, payload } = e.detail;

      switch (action) {
        case 'phase:set':
          // Set the current phase (pre/show/post)
          console.log(`Setting phase to: ${payload.phase}`);
          break;

        case 'navigate':
          // Navigate to a specific section
          console.log(`Navigating to: ${payload.to}`);
          break;

        case 'complete':
          // Mark something as complete
          console.log(`Completing ${payload.type}: ${payload.id}`);
          break;

        case 'reward:grant':
          // Grant a reward/memory
          console.log(`Granting reward: ${payload.memoryId}`);
          // Show a toast or animation
          showRewardGranted(payload.memoryId);
          break;

        case 'game:result':
          // Set game result
          console.log(`Game result: ${payload.gameId} - Grade ${payload.grade}`);
          break;

        default:
          console.log('Unknown demo action:', action);
      }
    };

    const handleGameAutoPass = () => {
      console.log('🎭 Auto-passing current game');
      // Auto-complete any active game
    };

    const handleShowUploader = () => {
      console.log('🎭 Showing uploader modal');
      // Show asset uploader
    };

    // Add event listeners
    window.addEventListener('demo:navigate', handleDemoNavigate as EventListener);
    window.addEventListener('demo:step', handleDemoStep as EventListener);
    window.addEventListener('demo:game:autoPass', handleGameAutoPass);
    window.addEventListener('demo:uploader:show', handleShowUploader);

    return () => {
      window.removeEventListener('demo:navigate', handleDemoNavigate as EventListener);
      window.removeEventListener('demo:step', handleDemoStep as EventListener);
      window.removeEventListener('demo:game:autoPass', handleGameAutoPass);
      window.removeEventListener('demo:uploader:show', handleShowUploader);
    };
  }, []);

  const togglePresenterMode = () => {
    setIsPresenterMode(!isPresenterMode);

    if (!isPresenterMode) {
      console.log('🎭 Presenter Mode ACTIVATED');
      // Optional: Show activation toast
    } else {
      console.log('🎭 Presenter Mode DEACTIVATED');
    }
  };

  return {
    isPresenterMode,
    togglePresenterMode
  };
}

// Helper function to show reward notifications
function showRewardGranted(memoryId: string) {
  // Create a toast notification
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg';
  toast.textContent = `🏆 Memory Unlocked: ${memoryId}`;

  document.body.appendChild(toast);

  // Animate in
  toast.style.opacity = '0';
  toast.style.transform = 'translate(-50%, -20px)';

  requestAnimationFrame(() => {
    toast.style.transition = 'all 0.3s ease-out';
    toast.style.opacity = '1';
    toast.style.transform = 'translate(-50%, 0px)';
  });

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, -20px)';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}