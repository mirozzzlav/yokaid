import { useContext, useMemo, useState, useEffect, useCallback } from 'react';
import useCall from 'src/hooks/useCall';
import config from 'src/config';
import { FilterContext, MapContext } from 'src/providers';

export function useGetProfessionals() {
  const [professionals, setProfessionals] = useState(null);
  const { getFilterUrl } = useContext(FilterContext);
  const [callId, setCallId] = useState(null);
  const call = useCall((response) => {
    setProfessionals(!response.error ? response.data : null);
  });

  const { mapAreaRequest } = useContext(MapContext);

  useEffect(() => {
    if (!callId) {
      return;
    }
    const filterUrl = getFilterUrl([config.map.columnAlias]);
    call(
      `${config.api.endPointsURLs.getProfessionals}/${
        config.map.columnAlias
      }=[${mapAreaRequest.bounds}]${filterUrl ? `;${filterUrl}` : ''}`,
      'get',
    );
  }, [callId]);

  return useMemo(
    () => ({
      callGetProfessionals: () => {
        setCallId(Math.random());
      },
      professionals,
    }),
    [professionals],
  );
}

export function useCreateProWithReviewCall(onCallFinish) {
  const call = useCall(onCallFinish);

  return useCallback((inputs) => {
    call(config.api.endPointsURLs.createProfessionalWithReview, 'post', inputs);
  }, []);
}
