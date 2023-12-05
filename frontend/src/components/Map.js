import React, { useCallback, useContext, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { Box } from '@chakra-ui/react';

import PropTypes from 'prop-types';
import L from 'leaflet';

import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import { css } from '@emotion/css';
import person from 'src/assets/person.png';
import theme from 'src/style';
import { unknownObjectValidator } from 'src/helpers';
import config from 'src/config';
import { MapContext } from 'src/providers';

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
const style = {
  filter: {
    '.leaflet-tile-pane': {
      filter: 'contrast(1.1) saturate(0.8)',
    },
  },
};

export default function Map({
  markers,
  onMarkerClick,
  onZoomOrMove: onZoomOrMoveFromProps,
}) {
  const mapElementRef = useRef(null);
  const centerRef = useRef(null);
  const zoomRef = useRef(config.map.defaultZoom);
  const clusterGroupRef = useRef(null);
  const mapLayersRef = useRef({});
  const { mapRef } = useContext(MapContext);

  const getBounds = useCallback(() => {
    const bounds = mapRef.current.getBounds();
    const { lat: swLat, lng: swLng } = bounds.getSouthWest();
    const { lat: neLat, lng: neLng } = bounds.getNorthEast();
    return [swLat, swLng, neLat, neLng];
  }, []);

  const onZoomOrMove = useCallback(() => {
    const center = mapRef.current.getCenter();

    if (
      zoomRef.current !== null &&
      centerRef.current !== null &&
      (Math.abs(mapRef.current.getZoom() - zoomRef.current) !== 0 ||
        Math.abs(center.lat - centerRef.current.lat) > 0.01 ||
        Math.abs(center.lng - centerRef.current.lng) > 0.01)
    ) {
      onZoomOrMoveFromProps({
        bounds: getBounds(),
        position: [center.lat, center.lng],
      });
    }

    zoomRef.current = mapRef.current.getZoom();
    centerRef.current = center;
  }, []);

  const initClusterGroup = useCallback(() => {
    clusterGroupRef.current = window.L.markerClusterGroup({
      // for some reason L.markerClusterGroup raised warning and
      // window.L.markerClusterGroup fixed it
      iconCreateFunction: (cluster) =>
        L.divIcon({
          className: css(mapClusterStyle),
          html: cluster.getChildCount(),
        }),
    });
    mapRef.current.addLayer(clusterGroupRef.current);
  }, [mapRef]);

  useEffect(() => {
    if (mapRef.current || !mapElementRef.current) {
      return;
    }
    const map = L.map(mapElementRef.current, {
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
    initClusterGroup();
    mapRef.current.addEventListener('zoomend moveend', onZoomOrMove);
  }, []);

  useEffect(() => {
    if (!clusterGroupRef.current) {
      return;
    }
    if (!markers) {
      clusterGroupRef.current.clearLayers();
      mapLayersRef.current = {};
      return;
    }

    // remove all layers that are not in new markers
    const newMapLayers = {};
    Object.entries(mapLayersRef.current).forEach(([markerIdLayer, layer]) => {
      if (
        !markers.find(
          ({ id: markerId }) => markerId === parseInt(markerIdLayer, 10),
        )
      ) {
        clusterGroupRef.current.removeLayer(layer);
        return;
      }
      newMapLayers[markerIdLayer] = layer;
    });
    mapLayersRef.current = newMapLayers;

    markers.forEach(({ locationLat, locationLng, id: markerId }) => {
      const icon = L.icon({
        className: 'marker-fade',
        iconUrl: person,
        iconSize: [40, 40],
        iconAnchor: [20, 20], // point of the icon which will correspond to marker's location
      });
      const marker = L.marker([locationLat, locationLng], { icon }).on(
        'click',
        () =>
          onMarkerClick({ id: markerId, position: [locationLat, locationLng] }),
      );

      if (mapLayersRef.current[markerId]) {
        return;
      }
      mapLayersRef.current[markerId] = marker;
      clusterGroupRef.current.addLayer(marker);
    });
  }, [markers, mapLayersRef, clusterGroupRef]);

  return <Box w="100%" h="100%" ref={mapElementRef} sx={style.filter} />;
}

Map.defaultProps = {
  markers: null,
};
Map.prototype.propTypes = {
  markers: PropTypes.oneOfType([
    PropTypes.arrayOf(unknownObjectValidator),
    PropTypes.oneOf([null]),
  ]),
  onZoomOrMove: PropTypes.func.isRequired,
  onMarkerClick: PropTypes.func.isRequired,
};
