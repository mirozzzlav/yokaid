import React, {
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import useCall from 'src/hooks/useCall';
import config from 'src/config';
import { FilterContext } from 'src/providers/FilterProvider';
import { MapContext } from 'src/providers/MapProvider';
import { ProfessionalInfoDropdown } from 'src/components/ProfessionalInfo';

export function useFilterProfessionals() {
  const [professionals, setProfessionals] = useState(null);
  const { getFilterSerialized } = useContext(FilterContext);
  const [callId, setCallId] = useState(null);
  const { call } = useCall((response, success) => {
    setProfessionals(success ? response.data : null);
  });

  const { mapAreaRequest } = useContext(MapContext);

  useEffect(() => {
    if (!callId) {
      return;
    }
    const filterUrlParam = getFilterSerialized([
      config.APIColumnAliases.location,
    ]);
    call(config.api.endPointsURLs.getProfessionals, [
      `${config.APIColumnAliases.location}=[${mapAreaRequest.bounds}]${
        filterUrlParam ? `;${filterUrlParam}` : ''
      }`,
    ]);
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

export function useSearchProfessional(onSearchFinish) {
  const { call } = useCall((response) => {
    onSearchFinish(
      response.data
        ? response.data.map((data) => ({
            content: <ProfessionalInfoDropdown data={data} />,
            value: data,
          }))
        : null,
    );
  });
  return useCallback(
    (professionalName) =>
      call(config.api.endPointsURLs.searchProfessionals, [professionalName]),
    [call],
  );
}
