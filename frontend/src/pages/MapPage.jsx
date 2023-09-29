import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  IconButton,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import Page from 'src/pages/Page';
import theme from 'src/style';

import {
  createReviewFormFactory,
  Map,
  SearchDropdown,
  ProfessionalInfoModal,
} from 'src/components';
import { FilterContext, InitialDataContext, MapContext } from 'src/providers';
import config from 'src/config';
import {
  useGetProfessionals,
  useNavigateAction,
  useSearchProfessional,
} from 'src/hooks';
import { AddIcon, SearchIcon } from '@chakra-ui/icons';
import { FilterIcon } from 'src/components/icons';
import {
  unknownObjectValidator,
  getMergedStyle,
  getStringFirstCaps,
} from 'src/helpers';
import PropTypes from 'prop-types';

function useStyle() {
  const style = {
    applyFiltersBtn: {
      flexShrink: 0,
    },
    filter: {
      gap: '0.4rem',
    },
    filterInfo: {
      gap: '0.4rem',
      alignItems: 'center',
      cursor: 'pointer',
    },
    mainSearch: {
      flexGrow: 0,
    },
    filterInfoButton: {
      flexGrow: 0,
    },
    filterInfoBlock: {
      flexGrow: 1,
      gap: '0.4rem',
      fontSize: '0.8rem',
      flexShrink: 0,
      overflowX: 'hidden',
    },
    filterInfoName: {
      lineHeight: '0.8rem',
      fontWeight: theme.fontWeights.bold,
      flexShrink: 0,
    },
    filterInfoVal: {
      lineHeight: '0.8rem',
      fontWeight: theme.fontWeights.light,
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      flexBasis: '100px',
      maxWidth: '150px',
      flexShrink: 0,
    },
    topContent: {
      gap: '1rem',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
  };

  const responsiveStyle = useBreakpointValue({
    base: {
      filter: {
        flexDirection: 'column',
      },
      addReviewBtn: {
        display: 'none',
      },
      filterInfo: {
        flexGrow: 1,
      },
      mainSearch: { flexBasis: '100%', flexGrow: 1 },
    },
    sm: {
      addReviewBtnMobile: {
        display: 'none',
      },
      filterInfo: {
        flexGrow: 1,
      },
      mainSearch: { flexBasis: '100%', flexGrow: 1 },
    },
    md: {
      mainSearch: { flexBasis: 'auto' },
    },
    lg: {
      filter: { flexDirection: 'row' },
      addReviewBtnMobile: {
        display: 'none',
      },
    },
  });

  return getMergedStyle(style, responsiveStyle);
}

function FilterInfo({
  filterInputValues: filterInputValuesFromProps,
  onClick,
  sx,
}) {
  const data = useMemo(
    () =>
      Object.fromEntries(
        config.filter.filterNames.map((filterName) => [
          filterName,
          filterInputValuesFromProps && filterInputValuesFromProps[filterName]
            ? filterInputValuesFromProps[filterName]
            : 'any',
        ]),
      ),
    [filterInputValuesFromProps],
  );
  const style = useStyle();

  return (
    <Flex sx={sx} onClick={onClick}>
      <IconButton sx={style.filterInfoButton} icon={<FilterIcon />} />
      {Object.entries(data).map(([fName, value]) => (
        <Box sx={style.filterInfoBlock} key={fName}>
          <Text sx={style.filterInfoName}>{getStringFirstCaps(fName)}</Text>
          <Text sx={style.filterInfoVal}>{value}</Text>
        </Box>
      ))}
    </Flex>
  );
}

FilterInfo.defaultProps = {
  sx: null,
};

FilterInfo.prototype.propTypes = {
  filterInputValues: unknownObjectValidator.isRequired,
  onClick: PropTypes.func.isRequired,
  sx: PropTypes.oneOfType([unknownObjectValidator, PropTypes.oneOf([null])]),
};

export default function MapPage() {
  const { navigateAction, action, actionParams } = useNavigateAction();

  const { filters: filtersInitialItems } = useContext(InitialDataContext);
  const { professionals, callGetProfessionals, getProfessional } =
    useGetProfessionals();
  const { moveMap, setMapAreaRequest, mapAreaRequest } = useContext(MapContext);

  const {
    filterItemsHookCreator,
    updateFilter,
    resetFilter,
    saveFilter,
    isFilterChanged,
    getIsFilterEqual,
    draft,
    isFilterShown,
    showFilter,
    hideFilter,
    filterInputValues,
    getFilterInputValSetter,
  } = useContext(FilterContext);

  useEffect(() => {
    callGetProfessionals();
  }, []);

  const [markers, setMarkers] = useState(null);
  const [selectedPro, setSelectedPro] = useState(null);
  const modalsConfig = useMemo(
    () => ({
      'add-review': {
        title: 'Add review',
        submitButton: {
          label: 'Submit',
        },
        form: createReviewFormFactory(selectedPro || null, {
          onProfessionalFound: (foundPro) =>
            navigateAction('add-review', btoa(JSON.stringify(foundPro))),
        }),
      },
    }),
    [selectedPro, mapAreaRequest],
  );
  const style = useStyle();
  useEffect(() => {
    if (professionals) {
      setMarkers(
        professionals.map(({ locationLat, locationLng, id }) => ({
          locationLat,
          locationLng,
          id,
        })),
      );
    } else {
      setMarkers(null);
    }
  }, [professionals]);

  useEffect(() => {
    const proRequest =
      (action === 'professional-detail' || action === 'add-review') &&
      actionParams
        ? actionParams
        : null;

    setSelectedPro(proRequest);
  }, [actionParams, professionals]);

  return (
    <Page
      mode="fullscreen"
      modalsConfig={modalsConfig}
      topContent={
        <Flex sx={style.topContent}>
          <FilterInfo
            filterInputValues={filterInputValues}
            onClick={showFilter}
            onOutsideClick={hideFilter}
            sx={style.filterInfo}
          />
          <SearchDropdown
            searchHook={useSearchProfessional}
            onValueSet={({ value }) => {
              navigateAction(
                'professional-detail',
                btoa(JSON.stringify(value)),
              );
            }}
            position="left"
            placeholder="Search people"
            sx={style.mainSearch}
            resetOnValueSet
          />
        </Flex>
      }
      onFilterOverlayClick={hideFilter}
      filterContent={
        isFilterShown ? (
          <Flex sx={style.filter}>
            {config.filter.filterNames.map((filterName) => {
              const useFilterItems = filterItemsHookCreator(filterName);
              const setInputVal = getFilterInputValSetter(filterName);
              return (
                <SearchDropdown
                  initialItems={filtersInitialItems[filterName]}
                  key={filterName}
                  searchHook={useFilterItems}
                  onValueSet={({ value, extraData }) => {
                    updateFilter({
                      [filterName]: {
                        value,
                        extraData,
                        ...(config.filter.APIColumnAliases[filterName]
                          ? {
                              columnAlias:
                                config.filter.APIColumnAliases[filterName],
                            }
                          : null),
                      },
                    });
                  }}
                  onValueEmpty={() => resetFilter(filterName)}
                  position="left"
                  placeholder={getStringFirstCaps(filterName)}
                  inputVal={
                    (filterInputValues && filterInputValues[filterName]) || ''
                  }
                  inputValSetter={setInputVal}
                  dropdownWidth="100%"
                />
              );
            })}
            <Button
              rightIcon={<SearchIcon />}
              onClick={() => {
                if (!isFilterChanged) {
                  return;
                }
                if (getIsFilterEqual('location')) {
                  // if not location search getting pros according to filters
                  callGetProfessionals();
                } else {
                  // if location search, moving map and then getting pros on different place
                  moveMap({
                    position: draft.location.extraData,
                    bounds: draft.location.value,
                  });
                }
                saveFilter();
                hideFilter();
              }}
              sx={style.applyFiltersBtn}
              isDisabled={!isFilterChanged}
            >
              Search
            </Button>
          </Flex>
        ) : null
      }
      footer={
        <>
          <Button
            onClick={() => navigateAction('add-review')}
            sx={style.addReviewBtn}
            colorScheme="blue"
            leftIcon={<AddIcon />}
          >
            Your review
          </Button>
          <IconButton
            icon={<AddIcon />}
            onClick={() => navigateAction('add-review')}
            sx={style.addReviewBtnMobile}
            colorScheme="blue"
          />
        </>
      }
    >
      <Map
        markers={markers}
        onZoomOrMove={(mapAreaFromMap) => {
          setMapAreaRequest(mapAreaFromMap);
          callGetProfessionals();
        }}
        onMarkerClick={({ id }) => {
          navigateAction(
            'professional-detail',
            btoa(JSON.stringify(getProfessional(id))),
          );
        }}
      />
      <ProfessionalInfoModal
        data={action === 'professional-detail' ? selectedPro : null}
        close={() => navigateAction(null)}
        isShown={!!selectedPro}
      />
    </Page>
  );
}
