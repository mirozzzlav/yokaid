import React, { createContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const thinScreenHeight = 350;
export const WindowScrollContext = createContext({});
export default function WindowScrollProvider({ children }) {
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [thinScreen, setThinScreen] = useState(
    window.innerHeight < thinScreenHeight,
  );
  const contextVal = useMemo(
    () => ({
      isScrolledDown,
      thinScreen,
    }),
    [isScrolledDown, thinScreen],
  );
  useEffect(() => {
    const onWindowScrolled = (e) => {
      setIsScrolledDown(
        e.target.scrollTop + e.target.clientHeight === e.target.scrollHeight,
      );
    };
    const onWindowResized = () =>
      setThinScreen(window.innerHeight < thinScreenHeight);
    window.addEventListener('scroll', onWindowScrolled, true);
    window.addEventListener('resize', onWindowResized);
    return () => {
      window.removeEventListener('scroll', onWindowScrolled);
      window.removeEventListener('resize', onWindowResized);
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
