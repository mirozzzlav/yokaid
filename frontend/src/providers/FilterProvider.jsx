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

function filtersEqual(f1, f2) {
  if (!f1 && !f2) {
    return true;
  }
  if ((f1 && !f2) || (!f1 && f2)) {
    return false;
  }
  return (
    JSON.stringify(f1.value) === JSON.stringify(f2.value) &&
    JSON.stringify(f1?.extraData) === JSON.stringify(f2?.extraData)
  );
}

export default function FilterProvider({ children }) {
  const [draft, setDraft] = useState(config.defaultFilter);
  const [filter, setFilter] = useState(config.defaultFilter);

  const contextVal = useMemo(() => {
    const isFilterChanged = (() => {
      const keys =
        Object.keys(draft).length > Object.keys(filter).length
          ? Object.keys(draft)
          : Object.keys(filter);
      return keys.some(
        (columnAlias) => !filtersEqual(draft[columnAlias], filter[columnAlias]),
      );
    })();

    return {
      filterItemsHookCreator,
      filter,
      draft,
      isFilterChanged,
      getIsFilterEqual: (columnAlias) =>
        filtersEqual(draft[columnAlias], filter[columnAlias]),
      saveFilter: () => {
        setFilter(draft);
      },
      getFilterUrl: (skipFilterColumnAliases = []) =>
        Object.entries(filter)
          .filter(([k]) => !skipFilterColumnAliases.includes(k))
          .map(
            ([columnAlias, { value }]) =>
              `${columnAlias}=${
                typeof value === 'object' ? JSON.stringify(value) : value
              }`,
          )
          .join(';'),
      updateFilter: (toUpdateFilter) => {
        setDraft((prevFilter) => ({
          ...prevFilter,
          ...toUpdateFilter,
        }));
      },
      resetFilter: (columnAliases) =>
        setDraft((prevFilter) => {
          if (!prevFilter) {
            return null;
          }
          const newFilterEntries = Object.entries(prevFilter).filter(
            ([k]) => !columnAliases.includes(k),
          );

          return newFilterEntries.length === 0
            ? null
            : Object.fromEntries(newFilterEntries);
        }),
    };
  }, [filter, draft]);

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
