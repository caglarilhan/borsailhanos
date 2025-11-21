import { useEffect, useState } from 'react';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export function useViewport() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('mobile');
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    function handleResize() {
      const currentWidth = window.innerWidth;
      setWidth(currentWidth);
      if (currentWidth >= 1280) {
        setBreakpoint('desktop');
      } else if (currentWidth >= 768) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('mobile');
      }
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { width, breakpoint, isMobile: breakpoint === 'mobile' };
}

export default useViewport;

