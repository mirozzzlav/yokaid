import React, { useCallback, useContext, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { Box } from '@chakra-ui/react';

import PropTypes from 'prop-types';
import L from 'leaflet';

import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import { css } from '@emotion/css';
import { renderToStaticMarkup } from 'react-dom/server';
import { theme } from 'src/style';
import MapPost from 'src/components/MapPost';
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

export default function Map({ mapPosts, onZoomOrMove: onZoomOrMoveFromProps }) {
  const mapElementRef = useRef(null);
  const centerRef = useRef(null);
  const zoomRef = useRef(config.map.defaultZoom);
  const clusterGroupRef = useRef(null);
  const mapLayersRef = useRef({});
  const { mapRef, moveMap } = useContext(MapContext);

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
    clusterGroupRef.current = L.markerClusterGroup({
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
    if (!mapPosts) {
      clusterGroupRef.current.clearLayers();
      mapLayersRef.current = {};
      return;
    }

    // remove all layers that are not in new mapPosts
    const newMapLayers = {};
    Object.entries(mapLayersRef.current).forEach(([mapPostIdLayer, layer]) => {
      if (
        !mapPosts.find(
          ({ id: mapPostId }) => mapPostId === parseInt(mapPostIdLayer, 10),
        )
      ) {
        clusterGroupRef.current.removeLayer(layer);
        return;
      }
      newMapLayers[mapPostIdLayer] = layer;
    });
    mapLayersRef.current = newMapLayers;

    mapPosts.forEach((mapPost) => {
      const marker = L.marker({
        lat: mapPost.latitude,
        lng: mapPost.longitude,
      }).bindPopup(
        renderToStaticMarkup(
          <MapPost
            id={mapPost.id}
            images={mapPost.imagePaths}
            text={mapPost.text}
            headline={mapPost.headline}
            item={
              mapPost.itemName && {
                name: mapPost.itemName,
                description: mapPost.itemDescription,
                category: mapPost.category,
              }
            }
            rent={
              mapPost.itemName && {
                dateFrom: mapPost.rentDateFrom,
                dateTo: mapPost.rentDateTo,
                price: mapPost.price,
              }
            }
          />,
        ),
        {
          className: css({
            maxWidth: '230px',
          }),
        },
      );
      if (mapLayersRef.current[mapPost.id]) {
        return;
      }
      mapLayersRef.current[mapPost.id] = marker;
      clusterGroupRef.current.addLayer(marker);
    });
  }, [mapPosts, mapLayersRef, clusterGroupRef]);

  return <Box w="100%" h="100%" ref={mapElementRef} />;
}

Map.defaultProps = {
  mapPosts: null,
};
Map.prototype.propTypes = {
  mapPosts: PropTypes.oneOfType([
    PropTypes.arrayOf(unknownObjectValidator),
    PropTypes.oneOf([null]),
  ]),
  onZoomOrMove: PropTypes.func.isRequired,
};
