import { useEffect } from 'react';

/**
 * Hook to set the page title
 * Updates the browser tab title and <title> element
 */
export const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = `VulnForge | ${title}`;
    
    // Cleanup - reset to default on unmount
    return () => {
      document.title = 'VulnForge';
    };
  }, [title]);
};

export default usePageTitle;
