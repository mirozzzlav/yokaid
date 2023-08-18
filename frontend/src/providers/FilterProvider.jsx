import React, { useCallback, useMemo, useState } from 'react';
import useCall from 'src/hooks/useCall';
import config from 'src/config';
import PropTypes from 'prop-types';
import { mapFilterColumnAlias } from 'src/constants';

function useMapFilterItmes(onSearchFinish) {
  const getItemsForMapFilter = useCallback(
    (results) =>
      results.map((place) => ({
        label: place.display_name,
        value: { position: [place.lat, place.lon], area: place.boundingbox },
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
  const [filter, setFilter] = useState(null);

  const contextVal = useMemo(
    () => ({
      filterItemsHookCreator,
      filter:
        filter === null
          ? ''
          : Object.values(filter).reduce(
              (
                prevFilterStr,
                { filterColumnAlias, filterOperator, filterValue },
              ) =>
                `${
                  prevFilterStr ? `${prevFilterStr};` : ''
                }${filterColumnAlias}${filterOperator}${filterValue}`,
              '',
            ),
      updateFilter: ({ filterColumnAlias, filterOperator, filterValue }) =>
        setFilter((prevFilter) => ({
          ...prevFilter,
          [filterColumnAlias]: {
            filterColumnAlias,
            filterOperator,
            filterValue,
          },
        })),
      resetFilters: () => {
        setFilter((prevFilter) => {
          return Object.fromEntries(
            Object.entries(prevFilter).filter(
              ([k]) => k === mapFilterColumnAlias,
            ),
          );
        });
      },
    }),
    [filter],
  );

  return (
    <FilterContext.Provider value={contextVal}>
      {children}
    </FilterContext.Provider>
  );
}
FilterProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
