import React, { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';

const defaultZoom = 14;

export default function useMap() {
  const map = useRef(null);

  return useMemo(
    () => ({
      init(mapElem) {
        if (map.current) {
          return;
        }
        const mapObj = L.map(mapElem, {
          zoomControl: false,
        }).setView([51.505, -0.09], defaultZoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(mapObj);
        L.control
          .zoom({
            position: 'bottomleft',
          })
          .addTo(mapObj);
        map.current = mapObj;
      },

      setMapPosition(position) {
        map.current.setView(position, defaultZoom);
      },
    }),
    [map],
  );
}
