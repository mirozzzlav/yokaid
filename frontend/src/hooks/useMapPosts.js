import useCall from 'src/hooks/useCall';
import config from 'src/config';
import { useMemo } from 'react';

export default function useMapPosts() {
  const { response, responseMeta, call } = useCall();

  return useMemo(() => {
    return {
      mapPosts: responseMeta.isReady ? response.data || [] : [],
      mapPostsCall({ bounds }) {
        call(
          `${config.api.endPointsURLs.getMapPosts}/${encodeURI(
            `latitude>=${bounds[0]};latitude<=${bounds[2]};longitude>=${bounds[1]};longitude<=${bounds[3]}`,
          )}`,
          'get',
        );
      },
    };
  }, [response, responseMeta]);
}
