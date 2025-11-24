import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';

/**
 * Scrolls the window to the top whenever the route path or URL parameters change.
 */
export const useScrollToTop = () => {
  const { pathname } = useLocation();
  const params = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, params]);
};