import { useCallback } from 'react';
import config from 'src/config';
import useCall from 'src/hooks/useCall';

export function dropdownResponseMapper(results) {
  return results
    ? results.map((d) => ({
        label: d.title,
        value: d,
      }))
    : null;
}

export default function useProfessionsSearch(
  onSearchFinish,
  responseMapper = dropdownResponseMapper,
) {
  const { call } = useCall((response) => {
    const results = responseMapper(response.data);
    onSearchFinish(results);
  });

  return useCallback(
    (professionTitle) =>
      call(config.api.endPointsURLs.getProfessions, [professionTitle]),
    [call],
  );
}
