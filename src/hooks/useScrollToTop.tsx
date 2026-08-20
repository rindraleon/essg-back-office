import { useEffect } from 'react';

const useScrollToTop = () => {
  // Scroll to top with smooth animation
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);
};

export default useScrollToTop;
