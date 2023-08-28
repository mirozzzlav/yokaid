import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import useCall from 'src/hooks/useCall';
import config from 'src/config';

function useMapFilterItmes(onSearchFinish) {
  const getItemsForMapFilter = useCallback(
    (results) =>
      results.map((place) => ({
        label: place.display_name,
        filterColumnAlias: config.map.columnAlias,
        value: [
          parseFloat(place.boundingbox[0]),
          parseFloat(place.boundingbox[2]),
          parseFloat(place.boundingbox[1]),
          parseFloat(place.boundingbox[3]),
        ],
        extraData: [place.lat, place.lon],
      })),

    [],
  );

  const call = useCall((response) => {
    const mapResults = getItemsForMapFilter(response.data);
    onSearchFinish(mapResults);
  });
  return useCallback(
    (searchedTerm) =>
      call(
        `https://nominatim.openstreetmap.org/search?q=${searchedTerm}&format=json`,
      ),
    [call],
  );
}

function filterItemsHookCreator(filterKey) {
  if (filterKey === 'where') {
    return useMapFilterItmes;
  }

  // default is items for what filter
  return (onSearchFinish = null) => {
    // hook itself
    const call = useCall((response) => {
      if (onSearchFinish) {
        onSearchFinish(response.data);
      }
    });
    return useCallback(
      (searchedFilterItem) =>
        call(
          `${config.api.endPointsURLs.getFilterItems}/${encodeURIComponent(
            'categories',
          )}/${searchedFilterItem}`,
        ),
      [call],
    );
  };
}
export const FilterContext = React.createContext({});

export default function FilterProvider({ children }) {
  const [draft, setDraft] = useState(config.defaultFilter);
  const [filter, setFilter] = useState(config.defaultFilter);

  const contextVal = useMemo(
    () => ({
      filterItemsHookCreator,
      filter,
      saveFilter: () => {
        setFilter(draft);
      },
      getFilterSerialized: () => {
        return Object.entries(filter)
          .map(
            ([columnAlias, { value }]) =>
              `${columnAlias}=${
                typeof value === 'object' ? JSON.stringify(value) : value
              }`,
          )
          .join(';');
      },
      updateFilter: (toUpdateFilter, save = false) => {
        if (save) {
          setFilter((prevFilter) => ({
            ...prevFilter,
            ...toUpdateFilter,
          }));
        } else {
          setDraft((prevFilter) => ({
            ...prevFilter,
            ...toUpdateFilter,
          }));
        }
      },
      resetFilter: (columnAliases) => {
        setDraft((prevFilter) => {
          return {
            ...config.defaultFilter,
            ...Object.fromEntries(
              Object.entries(prevFilter).filter(
                ([k]) => !columnAliases.includes(k),
              ),
            ),
          };
        });
      },
    }),
    [filter, draft],
  );

  return (
    <FilterContext.Provider value={contextVal}>
      {children}
    </FilterContext.Provider>
  );
}

FilterProvider.defaultProps = {};
FilterProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
