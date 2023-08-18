import React, { useContext } from 'react';
import 'leaflet/dist/leaflet.css';
import { Box } from '@chakra-ui/react';
import { MapContext } from 'src/providers';

function Map() {
  const { mapElementRef } = useContext(MapContext);
  return <Box w="100%" h="100%" ref={mapElementRef} />;
}

export default Map;
