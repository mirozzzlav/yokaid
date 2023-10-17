import { useContext, useMemo, useState, useEffect, useCallback } from 'react';
import useCall from 'src/hooks/useCall';
import config from 'src/config';
import { FilterContext, MapContext } from 'src/providers';
import { ProfessionalInfoDropdown } from 'src/components/ProfessionalInfo';
import { getLocalDataValue } from 'src/helpers';

export function useFilterProfessionals() {
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
      getFilteredProfessionals: () => {
        setCallId(Math.random());
      },
      professionals,
    }),
    [professionals],
  );
}

export function useGetProfessional(onSearchFinish) {
  const call = useCall((response) => {
    onSearchFinish(response.data ? response.data[0] : null);
  });
  const userPhone =
    getLocalDataValue('localStorageInputs', config.userIdName) || '';
  return useCallback(
    (professionalId) =>
      call(
        `${config.api.endPointsURLs.getProfessionalDetail}/${professionalId}${
          userPhone ? `/${userPhone}` : ''
        }`,
      ),
    [call],
  );
}

export function useSearchProfessional(onSearchFinish) {
  const call = useCall((response) => {
    onSearchFinish(
      response.data
        ? response.data.map((d) => ({
            renderer: ProfessionalInfoDropdown,
            label: `${d.fullName} - ${d.professions
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
