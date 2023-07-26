import useCall from 'src/hooks/useCall';
import config from 'src/config';
import { useMemo, useState } from 'react';

export default function useMapPosts() {
  const [mapPosts, setMapPosts] = useState(null);

  const call = useCall((response) => {
    setMapPosts(!response.error ? response.data : null);
  });

  return useMemo(
    () => ({
      mapPosts,
      mapPostsCall: (bounds) =>
        call(
          `${config.api.endPointsURLs.getMapPosts}/${encodeURI(
            `latitude>=${bounds[0]};latitude<=${bounds[2]};longitude>=${bounds[1]};longitude<=${bounds[3]}`,
          )}`,
          'get',
        ),
    }),
    [mapPosts],
  );
}
