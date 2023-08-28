import { useContext, useMemo, useState, useEffect } from 'react';
import useCall from 'src/hooks/useCall';
import config from 'src/config';
import { FilterContext, MapContext } from 'src/providers';

export default function useMapPosts() {
  const [mapPosts, setMapPosts] = useState(null);
  const { getFilterSerialized, filter } = useContext(FilterContext);
  const [postCallId, setPostCallId] = useState(null);
  const { setMapArea } = useContext(MapContext);

  const call = useCall((response) => {
    setMapPosts(!response.error ? response.data : null);
  });

  useEffect(() => {
    let mapArea = null;
    if (!postCallId) {
      return;
    }
    if (filter && filter[config.map.columnAlias]) {
      mapArea = {
        position: filter[config.map.columnAlias].extraData,
        bounds: filter[config.map.columnAlias].value,
      };
    }
    setMapArea(mapArea);
    const filterSerialized = getFilterSerialized();
    call(
      `${config.api.endPointsURLs.getPosts}${
        filterSerialized ? `/${filterSerialized}` : ''
      }`,
      'get',
    );
  }, [postCallId, filter]);

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
