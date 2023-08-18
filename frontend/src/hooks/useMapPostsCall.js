import useCall from 'src/hooks/useCall';
import config from 'src/config';
import { useMemo, useState } from 'react';

export default function useMapPostsCall() {
  const [mapPosts, setMapPosts] = useState(null);

  const call = useCall((response) => {
    setMapPosts(!response.error ? response.data : null);
  });

  return useMemo(
    () => ({
      mapPosts,
      mapPostsCall: (filter) =>
        call(
          `${config.api.endPointsURLs.getPosts}${filter ? `/${filter}` : ''}`,
          'get',
        ),
    }),
    [mapPosts],
  );
}
