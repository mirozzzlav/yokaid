import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import L from 'leaflet';

import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import { css } from '@emotion/css';
import { theme } from 'src/style';
import { renderToStaticMarkup } from 'react-dom/server';
import MapPost from 'src/components/MapPost';
import { FilterContext } from 'src/providers/FilterProvider';
import { mapFilterColumnAlias } from 'src/constants';

const mapDefaultZoom = 14;
const mapDefaultPosition = [51.505, -0.09];

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

function getMapFilter(bounds) {
  return {
    filterColumnAlias: mapFilterColumnAlias,
    filterOperator: '=',
    filterValue: `[${bounds.map((v) => parseFloat(v)).join(',')}]`,
  };
}

export const MapContext = React.createContext({});

export default function MapProvider({ children, mapPostsCallHook }) {
  const mapRef = useRef(null);
  const mapElementRef = useRef(null);
  const centerRef = useRef(null);
  const zoomRef = useRef(mapDefaultZoom);
  const clusterGroupRef = useRef(null);
  const { mapPostsCall, mapPosts } = mapPostsCallHook();
  const mapLayersRef = useRef({});
  const [mapBounds, setMapBounds] = useState(null);
  const { filter, updateFilter } = useContext(FilterContext);

  const updateMapBounds = useCallback(() => {
    const bounds = mapRef.current.getBounds();
    const { lat: swLat, lng: swLng } = bounds.getSouthWest();
    const { lat: neLat, lng: neLng } = bounds.getNorthEast();
    setMapBounds([swLat, swLng, neLat, neLng]);
  }, []);

  const onZoomOrMove = useCallback(() => {
    const center = mapRef.current.getCenter();

    if (
      zoomRef.current === null ||
      Math.abs(mapRef.current.getZoom() - zoomRef.current) !== 0
    ) {
      centerRef.current = center;
      zoomRef.current = mapRef.current.getZoom();
      updateMapBounds();
    }

    if (
      centerRef.current === null ||
      Math.abs(center.lat - centerRef.current.lat) > 0.01 ||
      Math.abs(center.lng - centerRef.current.lng) > 0.01
    ) {
      centerRef.current = center;
      updateMapBounds();
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

  const resetMap = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.setView(mapDefaultPosition, mapDefaultZoom);
    }
  }, []);

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
    resetMap();
    initClusterGroup();
    mapRef.current.on('zoomend', onZoomOrMove);
    mapRef.current.on('moveend', onZoomOrMove);
  }, [mapElementRef, mapRef, onZoomOrMove]);

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
    Object.entries(mapLayersRef.current).forEach(([mapPostIdLayer, layer]) => {
      if (
        !mapPosts.find(
          ({ id: mapPostId }) => mapPostId === parseInt(mapPostIdLayer, 10),
        )
      ) {
        clusterGroupRef.current.removeLayer(layer);
      }
    });

    mapPosts
      .filter(({ id }) => !mapLayersRef.current[id])
      .forEach((mapPost) => {
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
        clusterGroupRef.current.addLayer(marker);
        mapLayersRef.current = {
          ...mapLayersRef.current,
          [mapPost.id]: marker,
        };
      });
  }, [mapPosts, mapLayersRef, clusterGroupRef]);

  useEffect(() => {
    if (mapRef.current) {
      updateMapBounds();
    }
  }, [mapRef]);

  useEffect(() => {
    if (!mapBounds) {
      return;
    }
    updateFilter(getMapFilter(mapBounds));
  }, [mapBounds]);

  useEffect(() => {
    mapPostsCall(filter);
  }, [filter]);

  const contextVal = useMemo(
    () => ({
      mapElementRef,
      setMapPosition: ({ position, area = null }) => {
        if (!mapRef.current) {
          return;
        }
        mapRef.current.setView(
          position,
          area === null ? mapDefaultZoom : calculateZoom(area),
        );
      },
      resetMap,
    }),
    [mapElementRef, mapRef],
  );

  return (
    <MapContext.Provider value={contextVal}>{children}</MapContext.Provider>
  );
}

MapProvider.propTypes = {
  children: PropTypes.node.isRequired,
  mapPostsCallHook: PropTypes.func.isRequired,
};
