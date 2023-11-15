import { useCallback } from 'react';
import config from 'src/config';
import useCall from 'src/hooks/useCall';

export default function useGetList(onSearchFinish) {
  const { call } = useCall(onSearchFinish);
  return useCallback(
    (columnAlias, searchedTerm) => {
      call(config.api.endPointsURLs.getList, [columnAlias, searchedTerm]);
    },
    [call],
  );
}
