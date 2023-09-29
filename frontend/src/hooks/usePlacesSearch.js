import { useCallback } from 'react';
import useCall from 'src/hooks/useCall';

function defaultResponseMapper(results) {
  return results.map(({ display_name: label, lat, lon }) => ({
    label,
    value: [lat, lon],
  }));
}
export default function usePlacesSearch(
  onSearchFinish,
  responseMapper = defaultResponseMapper,
) {
  const call = useCall((response) => {
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
