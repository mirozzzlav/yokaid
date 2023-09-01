import { useContext, useMemo, useState, useEffect } from 'react';
import useCall from 'src/hooks/useCall';
import config from 'src/config';
import { FilterContext, MapContext } from 'src/providers';

export default function useMapPosts() {
  const [mapPosts, setMapPosts] = useState(null);
  const { getFilterUrl } = useContext(FilterContext);
  const [postCallId, setPostCallId] = useState(null);
  const call = useCall((response) => {
    setMapPosts(!response.error ? response.data : null);
  });

  const { mapAreaRequestRef } = useContext(MapContext);

  useEffect(() => {
    if (!postCallId) {
      return;
    }
    const filterUrl = getFilterUrl([config.map.columnAlias]);
    call(
      `${config.api.endPointsURLs.getPosts}/${config.map.columnAlias}=[${
        mapAreaRequestRef.current.bounds
      }]${filterUrl ? `;${filterUrl}` : ''}`,
      'get',
    );
  }, [postCallId]);

  return useMemo(
    () => ({
      callGetMapPosts: () => {
        setPostCallId(Math.random());
      },
      mapPosts,
    }),
    [mapPosts],
  );
}
