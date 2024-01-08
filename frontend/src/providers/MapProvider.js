import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import config from 'src/config';

export const MapContext = createContext({});
export default function MapProvider({ children }) {
  const mapRef = useRef(null);
  const [mapAreaRequest, setMapAreaRequest] = useState(config.map.defaultArea);

  const calculateZoom = useCallback((bounds) => {
    const widthFactor = 1.7;
    const boundsNum = bounds.map((p) => parseFloat(p));
    const width = boundsNum[2] - boundsNum[0];
    const zoom = Math.floor(Math.log2((360 * widthFactor) / width));
    return zoom < 3 ? 3 : zoom;
  }, []);

  const moveMap = useCallback((mapArea) => {
    if (!mapRef.current) {
      return;
    }
    mapRef.current.setView(mapArea.position, calculateZoom(mapArea.bounds));
  }, []);

  const contextVal = useMemo(
    () => ({
      mapRef,
      moveMap,
      mapAreaRequest,
      setMapAreaRequest,
    }),
    [mapRef, mapAreaRequest],
  );

  return (
    <MapContext.Provider value={contextVal}>{children}</MapContext.Provider>
  );
}

MapProvider.prototype.propTypes = {
  children: PropTypes.node.isRequired,
};
