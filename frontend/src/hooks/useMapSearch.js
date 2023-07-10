import { useCallback, useState } from 'react';

export default function useMapSearch() {
  const [searchResponse, setSearchResponseRaw] = useState(null);

  const setSearchResponse = useCallback(
    (placesFromAPI) =>
      setSearchResponseRaw(
        placesFromAPI.map((place) => ({
          id: place.place_id,
          text: place.display_name,
          value: JSON.stringify([place.lat, place.lon]),
        })),
      ),
    [setSearchResponseRaw],
  );

  const search = useCallback((searchedTerm) => {
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${searchedTerm}&format=json`,
    )
      .then((response) => response.json())
      .then((response) => {
        setSearchResponse(response);
      })
      .catch(() => {
        console.error('Map API error');
      });
  }, []);

  return {
    search,
    searchResponse,
  };
}
