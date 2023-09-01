import React, {
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import config from 'src/config';

export const MapContext = createContext({});
export default function MapProvider({ children }) {
  const mapRef = useRef(null);
  const mapAreaRequestRef = useRef(config.map.defaultArea);

  const calculateZoom = useCallback((bounds) => {
    const widthFactor = 1.7;
    const boundsNum = bounds.map((p) => parseFloat(p));
    const width = boundsNum[2] - boundsNum[0];
    const zoom = Math.floor(Math.log2((360 * widthFactor) / width));
    return zoom < 3 ? 3 : zoom;
  }, []);

  const contextVal = useMemo(
    () => ({
      mapRef,
      moveMap: (mapArea) => {
        if (!mapRef.current) {
          return;
        }
        mapRef.current.setView(mapArea.position, calculateZoom(mapArea.bounds));
      },
      mapAreaRequestRef,
      setMapAreaRequest: (newMapArea) => {
        mapAreaRequestRef.current = newMapArea;
      },
    }),
    [mapRef],
  );

  return (
    <MapContext.Provider value={contextVal}>{children}</MapContext.Provider>
  );
}

MapProvider.prototype.propTypes = {
  children: PropTypes.node.isRequired,
};
