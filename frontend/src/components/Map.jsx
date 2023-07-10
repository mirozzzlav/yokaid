import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export default function Map() {
  const mapDiv = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) {
      return;
    }
    map.current = L.map(mapDiv.current, {
      zoomControl: false,
    }).setView([51.505, -0.09], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map.current);
    L.control
      .zoom({
        position: 'bottomleft',
      })
      .addTo(map.current);
  }, []);
  return <div ref={mapDiv} className="w-full h-full" />;
}
