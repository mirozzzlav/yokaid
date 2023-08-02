import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import L from 'leaflet';

import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import { css } from '@emotion/css';
import { theme } from 'src/style';
import { renderToStaticMarkup } from 'react-dom/server';
import MapPost from 'src/components/MapPost';

const defaultZoom = 14;
const defaultPosition = [51.505, -0.09];

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
  const widthFactor = 1.7;
  const areaNum = area.map((p) => parseFloat(p));
  const width = areaNum[1] - areaNum[0];
  const zoom = Math.floor(Math.log2((360 * widthFactor) / width));

  return zoom < 3 ? 3 : zoom;
}

export const MapContext = React.createContext([]);

export default function MapProvider({ children, searchMapPostsHook }) {
  const mapRef = useRef(null);
  const mapElementRef = useRef(null);
  const centerRef = useRef(null);
  const zoomRef = useRef(defaultZoom);
  const clusterGroupRef = useRef(null);
  const { mapPostsCall, mapPosts } = searchMapPostsHook();
  const mapPostsIdsRef = useRef([]);

  const getBounds = useCallback(() => {
    const bounds = mapRef.current.getBounds();
    const { lat: swLat, lng: swLng } = bounds.getSouthWest();
    const { lat: neLat, lng: neLng } = bounds.getNorthEast();
    return [swLat, swLng, neLat, neLng];
  }, []);

  const onZoomOrMove = useCallback(() => {
    const center = mapRef.current.getCenter();
    const bounds = getBounds();

    if (
      zoomRef.current === null ||
      Math.abs(mapRef.current.getZoom() - zoomRef.current) !== 0
    ) {
      centerRef.current = center;
      zoomRef.current = mapRef.current.getZoom();
      mapPostsCall(bounds);
    }

    if (
      centerRef.current === null ||
      Math.abs(center.lat - centerRef.current.lat) > 0.01 ||
      Math.abs(center.lng - centerRef.current.lng) > 0.01
    ) {
      centerRef.current = center;
      mapPostsCall(bounds);
    }
  }, [centerRef, zoomRef]);

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
    mapRef.current.setView(defaultPosition, defaultZoom);
    initClusterGroup();
    mapRef.current.on('zoomend', onZoomOrMove);
    mapRef.current.on('moveend', onZoomOrMove);
  }, [mapElementRef, mapRef, onZoomOrMove]);

  useEffect(() => {
    if (!mapPosts || !clusterGroupRef.current) {
      return;
    }
    mapPosts
      .filter(({ Id }) => !mapPostsIdsRef.current.includes(Id))
      .forEach((mapPost) => {
        mapPostsIdsRef.current = [...mapPostsIdsRef.current, mapPost.Id];
        const marker = L.marker({
          lat: mapPost.Latitude,
          lng: mapPost.Longitude,
        }).bindPopup(
          renderToStaticMarkup(
            <MapPost
              id={mapPost.Id}
              images={mapPost.ImagePaths}
              text={mapPost.Text}
              headline={mapPost.Headline}
              item={
                mapPost.ItemName && {
                  name: mapPost.ItemName,
                  description: mapPost.ItemDescription,
                }
              }
              rent={
                mapPost.ItemName && {
                  dateFrom: mapPost.RentDateFrom,
                  dateTo: mapPost.RentDateTo,
                  price: mapPost.Price,
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
        clusterGroupRef.current.addLayer(marker);
      });
  }, [mapPosts, mapPostsIdsRef, clusterGroupRef]);

  useEffect(() => {
    if (mapRef.current) {
      mapPostsCall(getBounds());
    }
  }, [mapRef]);

  const contextVal = useMemo(
    () => ({
      mapElementRef,
      setMapPosition: ({ position, area = null }) => {
        if (!mapRef.current) {
          return;
        }
        mapRef.current.setView(
          position,
          area === null ? defaultZoom : calculateZoom(area),
        );
      },
    }),
    [mapElementRef, mapRef],
  );

  return (
    <MapContext.Provider value={contextVal}>{children}</MapContext.Provider>
  );
}

MapProvider.propTypes = {
  children: PropTypes.node.isRequired,
  searchMapPostsHook: PropTypes.func.isRequired,
};
