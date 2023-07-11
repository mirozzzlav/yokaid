import { useCallback, useMemo } from 'react';
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

export default function useMapSearch() {
  const { response, responseMeta, call } = useCall();

  const searchCall = useCallback((searchedTerm) => {
    call(
      `https://nominatim.openstreetmap.org/search?q=${searchedTerm}&format=json`,
    );
  }, []);

  const foundItems = useMemo(() => {
    if (responseMeta.isReady) {
      return response.data.map((place) => ({
        id: place.place_id,
        text: place.display_name,
        value: [place.lat, place.lon],
      }));
    }
    return [];
  }, [response, responseMeta]);
  return {
    responseMeta,
    searchCall,
    foundItems,
  };
}
