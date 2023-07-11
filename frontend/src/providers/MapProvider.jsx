import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';

const defaultZoom = 14;

export const MapContext = React.createContext([]);

export default function MapProvider({ children }) {
  const mapRef = useRef(null);
  const contextVal = useMemo(
    () => ({
      setMap(map) {
        mapRef.current = map;
      },
      getMap() {
        return mapRef.current || null;
      },
      setMapPosition(position) {
        mapRef.current.setView(position, defaultZoom);
      },
    }),
    [],
  );

  return (
    <MapContext.Provider value={contextVal}>{children}</MapContext.Provider>
  );
}

MapProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
