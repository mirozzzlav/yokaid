import React, { createContext, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';

export const MapContext = createContext({});
export default function MapProvider({ children }) {
  const mapRef = useRef(null);

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
      setMapArea: (mapArea) => {
        if (!mapRef.current) {
          return;
        }
        if (!mapArea) {
          return;
        }
        mapRef.current.setView(mapArea.position, calculateZoom(mapArea.bounds));
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
