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

export function useMapSearchRaw(onSearchFinish) {
  const call = useCall(onSearchFinish);
  return useCallback(
    (searchedTerm) =>
      call(
        `https://nominatim.openstreetmap.org/search?q=${searchedTerm}&format=json`,
      ),
    [call],
  );
}

function mapResposneToMapResults(response) {
  return response.data.map((place) => ({
    id: place.place_id,
    label: place.display_name,
    value: { position: [place.lat, place.lon], area: place.boundingbox },
  }));
}

export default function useMapSearch(onSearchFinish) {
  return useMapSearchRaw((response) => {
    const mapResults = mapResposneToMapResults(response);
    onSearchFinish(mapResults);
  });
}
