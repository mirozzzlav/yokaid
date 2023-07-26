import { useCallback, useMemo, useState } from 'react';
import { useCall } from 'src/hooks/index';

// function useDelayedCall(useCall) {
//   const { response, state, callRaw } = useCall();
//   const timeout = useRef(null);
//
//   const call = useCallback((v) => {
//     // valueRef.current = v;
//     if (timeout.current) {
//       return;
//     }
//
//     timeout.current = setTimeout(() => {
//       // search(valueRef.current);
//       timeout.current = null;
//     }, 500);
//   }, []);
//
//   return { call, state, response };
// }

export default function useMapSearch(onSearchFinish) {
  const [searchResults, setSearchResults] = useState(null);
  const getMapResults = useCallback((response) => {
    setSearchResults(
      response.data.map((place) => ({
        id: place.place_id,
        label: place.display_name,
        value: { position: [place.lat, place.lon], area: place.boundingbox },
      })),
    );
    onSearchFinish(response.data);
  }, []);

  const call = useCall(getMapResults);
  const searchCall = useCallback((searchedTerm) => {
    call(
      `https://nominatim.openstreetmap.org/search?q=${searchedTerm}&format=json`,
    );
  }, []);

  return {
    searchCall,
    searchResults,
  };
}
