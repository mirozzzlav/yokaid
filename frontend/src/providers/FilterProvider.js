import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import config from 'src/config';
import usePlacesSearch from 'src/hooks/usePlacesSearch';
import useProfessionsSearch from 'src/hooks/useProfessionsSearch';

function filterItemsHookCreator(filterName) {
  if (filterName === 'location') {
    return usePlacesSearch;
  }

  return useProfessionsSearch;
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

    const getIsFilterDefault = (filterName) => {
      if (filterName) {
        return filtersEqual(
          filter[filterName],
          config.filter.defaultFilter[filterName],
        );
      }
      const keys =
        Object.keys(draft).length > Object.keys(filter).length
          ? Object.keys(draft)
          : Object.keys(filter);

      return keys.every((iterFilterName) =>
        filtersEqual(
          config.filter.defaultFilter[iterFilterName],
          filter[iterFilterName],
        ),
      );
    };

    return {
      filterItemsHookCreator,
      filter,
      draft,
      isFilterChanged,
      getIsFilterDefault,
      getIsFilterEqual: (filterName) =>
        filtersEqual(draft[filterName], filter[filterName]),
      saveFilter: () => {
        setFilter(draft);
      },
      getFilterSerialized: (skipFilterColumnAliases = []) =>
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
      resetDraft: (filterName) =>
        setDraft((prevFilter) => ({
          ...config.filter.defaultFilter,
          ...Object.fromEntries(
            Object.entries(prevFilter).filter(([k]) => k !== filterName),
          ),
        })),
      resetFilter: () => {
        setDraft(config.filter.defaultFilter);
        setFilter(config.filter.defaultFilter);
        setFilterInputValues(null);
      },
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
