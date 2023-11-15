import { useCallback } from 'react';
import useCall from 'src/hooks/useCall';

function dropdownResponseMapper(results) {
  return results.map((place) => ({
    label: place.display_name,
    value: [
      parseFloat(place.boundingbox[0]),
      parseFloat(place.boundingbox[2]),
      parseFloat(place.boundingbox[1]),
      parseFloat(place.boundingbox[3]),
    ],
    extraData: [place.lat, place.lon],
  }));
}

export default function usePlacesSearch(
  onSearchFinish,
  responseMapper = dropdownResponseMapper,
) {
  const { call } = useCall((response) => {
    const mapResults = responseMapper(response.data);
    onSearchFinish(mapResults);
  });
  return useCallback(
    (searchedPlace) =>
      call(
        `https://nominatim.openstreetmap.org/search?city=${searchedPlace}&featureType=city&format=json`,
      ),
    [call],
  );
}
