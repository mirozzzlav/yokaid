import React, { useContext, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Box } from '@chakra-ui/react';
import { MapContext } from 'src/providers/MapProvider';

export default function Map() {
  const mapDiv = useRef(null);
  const { setMap, getMap, setMapPosition } = useContext(MapContext);

  useEffect(() => {
    let map = getMap();
    if (map) {
      return;
    }
    map = L.map(mapDiv.current, {
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

    setMap(map);
    setMapPosition([51.505, -0.09]);
  }, []);
  return <Box ref={mapDiv} w="100%" h="100%" />;
}
