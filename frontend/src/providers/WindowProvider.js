import React, {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';

const thinScreenHeight = 350;
export const WindowContext = createContext({});
export default function WindowProvider({ children }) {
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const lastHeightRef = useRef(null);
  const [screenHeight, setScreenHeight] = useState(-1);
  const effectExecutedRef = useRef(false);
  const [thinScreen, setThinScreen] = useState(
    window.innerHeight < thinScreenHeight,
  );
  const contextVal = useMemo(
    () => ({
      isScrolledDown,
      thinScreen,
      screenHeight,
    }),
    [isScrolledDown, thinScreen, screenHeight],
  );
  useEffect(() => {
    if (effectExecutedRef.current) {
      return;
    }
    effectExecutedRef.current = true;

    const onWindowScrolled = (e) => {
      setIsScrolledDown(
        e.target.scrollTop + e.target.clientHeight === e.target.scrollHeight,
      );
    };

    const onWindowResized = () => {
      setThinScreen(window.innerHeight < thinScreenHeight);
      setScreenHeight(window.innerHeight);
    };
    window.addEventListener('scroll', onWindowScrolled, true);
    window.addEventListener('resize', onWindowResized);
  }, [lastHeightRef.current]);

  return (
    <WindowContext.Provider value={contextVal}>
      {children}
    </WindowContext.Provider>
  );
}

WindowProvider.prototype.propTypes = {
  children: PropTypes.node.isRequired,
};
