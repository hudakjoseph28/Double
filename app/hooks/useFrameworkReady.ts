import { useEffect } from 'react';

/**
 * @description Hook to notify the framework when the app is ready
 * @pre Window object is available
 * @post Framework ready callback is executed if available
 */
declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  useEffect(() => {
    window.frameworkReady?.();
  }, []);
}