import React, { useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import L from 'leaflet';

import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import { css } from '@emotion/css';
import { theme } from 'src/style';
import { renderToStaticMarkup } from 'react-dom/server';

const defaultZoom = 14;

const mapClusterStyle = {
  border: 0,
  background: 'rgba(255,255,255, 0.9)',
  borderRadius: theme.radii.lg,
  width: 'auto !important',
  padding: '15px 20px',
  boxShadow: theme.shadows.xs,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.1rem',
};

function calculateZoom(area) {
  if (area === null || area.length != 4) {
    return defaultZoom;
  }

  const widthFactor = 1.7;
  const areaNum = area.map((p) => parseFloat(p));
  const width = areaNum[1] - areaNum[0];
  const zoom = Math.floor(Math.log2((360 * widthFactor) / width));

  return zoom < 3 ? 3 : zoom;
}

export const MapContext = React.createContext([]);

export default function MapProvider({ children }) {
  const mapRef = useRef(null);

  const addMarkers = useCallback((markers) => {
    const clusterGroup = L.markerClusterGroup({
      iconCreateFunction(cluster) {
        return L.divIcon({
          className: css(mapClusterStyle),
          html: cluster.getChildCount(),
        });
      },
    });

    markers.forEach((m) => {
      const marker = L.marker(m.position).bindPopup(
        renderToStaticMarkup(m.component),
      );
      clusterGroup.addLayer(marker);
    });
    mapRef.current.addLayer(clusterGroup);
  }, []);

  const contextVal = useMemo(
    () => ({
      setMapPosition({ position, area = null }) {
        mapRef.current.setView(position, calculateZoom(area));
      },
      initMap({ mapDivRef, position = [51.505, -0.09], markers }) {
        if (mapRef.current) {
          return;
        }
        const map = L.map(mapDivRef.current, {
          zoomControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(map);
        L.control
          .zoom({
            position: 'bottomleft',
          })
          .addTo(map);

        mapRef.current = map;
        mapRef.current.setView(position, defaultZoom);

        addMarkers(markers);
      },
      addMarkers,
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
