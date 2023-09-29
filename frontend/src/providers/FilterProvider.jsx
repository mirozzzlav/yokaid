import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import useCall from 'src/hooks/useCall';
import config from 'src/config';
import usePlacesSearch from 'src/hooks/usePlacesSearch';

function useMapFilterItmes(onSearchFinish) {
  const getItemsForMapFilter = useCallback(
    (results) =>
      results.map((place) => ({
        label: place.display_name,
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

  return usePlacesSearch(onSearchFinish, getItemsForMapFilter);
}

function filterItemsHookCreator(filterName) {
  if (filterName === 'location') {
    return useMapFilterItmes;
  }

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
          `${config.api.endPointsURLs.getFilterItems}/${config.filter.APIColumnAliases[filterName]}/${searchedFilterItem}`,
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
    JSON.stringify(f1.columnAlias) === JSON.stringify(f2.columnAlias) &&
    JSON.stringify(f1?.extraData) === JSON.stringify(f2?.extraData)
  );
}

export default function FilterProvider({ children }) {
  const [draft, setDraft] = useState(config.filter.defaultFilter);
  const [filter, setFilter] = useState(config.filter.defaultFilter);
  const [isShown, setIsShown] = useState(false);
  const [filterInputValues, setFilterInputValues] = useState(null);

  const contextVal = useMemo(() => {
    const isFilterChanged = (() => {
      const keys =
        Object.keys(draft).length > Object.keys(filter).length
          ? Object.keys(draft)
          : Object.keys(filter);
      return keys.some(
        (filterName) => !filtersEqual(draft[filterName], filter[filterName]),
      );
    })();

    return {
      filterItemsHookCreator,
      filter,
      draft,
      isFilterChanged,
      getIsFilterEqual: (filterName) =>
        filtersEqual(draft[filterName], filter[filterName]),
      saveFilter: () => {
        setFilter(draft);
      },
      getFilterUrl: (skipFilterColumnAliases = []) =>
        Object.values(filter)
          .filter(
            ({ columnAlias }) => !skipFilterColumnAliases.includes(columnAlias),
          )
          .map(
            ({ columnAlias, value }) =>
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
      resetFilter: (filterName) =>
        setDraft((prevFilter) => ({
          ...config.filter.defaultFilter,
          ...Object.fromEntries(
            Object.entries(prevFilter).filter(([k]) => k !== filterName),
          ),
        })),
      isFilterShown: isShown,
      showFilter: () => setIsShown(true),
      hideFilter: () => setIsShown(false),
      filterInputValues,
      getFilterInputValSetter: (filterName) => (inputVal) =>
        setFilterInputValues((prevFilter) => ({
          ...prevFilter,
          [filterName]: inputVal,
        })),
    };
  }, [filter, draft, isShown, filterInputValues]);

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
