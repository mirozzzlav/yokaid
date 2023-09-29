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
    const filterUrl = getFilterUrl([config.filter.APIColumnAliases.location]);
    call(
      `${config.api.endPointsURLs.getProfessionals}/${
        config.filter.APIColumnAliases.location
      }=[${mapAreaRequest.bounds}]${filterUrl ? `;${filterUrl}` : ''}`,
      'get',
    );
  }, [callId]);

  return useMemo(
    () => ({
      callGetProfessionals: () => {
        setCallId(Math.random());
      },
      getProfessional: (idToFind) => {
        if (!professionals) {
          return null;
        }
        return professionals.find(({ id }) => id === idToFind) || null;
      },
      professionals,
    }),
    [professionals],
  );
}

export function useSearchProfessional(onSearchFinish) {
  const call = useCall((response) => {
    onSearchFinish(
      response.data
        ? response.data.map((d) => ({
            label: `${d.fullName} - ${d.services
              .map(({ title }) => title)
              .join(', ')}`,
            value: d,
          }))
        : null,
    );
  });
  return useCallback(
    (professionalName) =>
      call(
        `${config.api.endPointsURLs.searchProfessionals}/${professionalName}`,
      ),
    [call],
  );
}
