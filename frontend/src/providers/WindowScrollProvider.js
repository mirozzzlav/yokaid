import React, { createContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

export const WindowScrollContext = createContext({});
export default function WindowScrollProvider({ children }) {
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const contextVal = useMemo(
    () => ({
      isScrolledDown,
    }),
    [isScrolledDown],
  );
  useEffect(() => {
    const onWindowScrolled = (e) => {
      setIsScrolledDown(
        e.target.scrollTop + e.target.clientHeight === e.target.scrollHeight,
      );
    };
    window.addEventListener('scroll', onWindowScrolled, true);
    return () => {
      window.removeEventListener('scroll', onWindowScrolled);
    };
  }, []);

  return (
    <WindowScrollContext.Provider value={contextVal}>
      {children}
    </WindowScrollContext.Provider>
  );
}

WindowScrollProvider.prototype.propTypes = {
  children: PropTypes.node.isRequired,
};
