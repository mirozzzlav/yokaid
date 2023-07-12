import React, { useContext, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { Box } from '@chakra-ui/react';
import { MapContext } from 'src/providers/MapProvider';
import PropTypes from 'prop-types';

export default function Map({ markers }) {
  const mapDivRef = useRef(null);
  const { initMap } = useContext(MapContext);

  useEffect(() => {
    initMap({ mapDivRef, markers });
  }, [markers]);
  return <Box ref={mapDivRef} w="100%" h="100%" />;
}
Map.defaultProps = {
  markers: [],
};

Map.propTypes = {
  markers: PropTypes.arrayOf(
    PropTypes.shape({
      position: PropTypes.arrayOf(PropTypes.number),
      component: PropTypes.node,
    }),
  ),
};
