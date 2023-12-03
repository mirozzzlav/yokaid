import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Box, Button, Flex, useBreakpointValue } from '@chakra-ui/react';
import Page from 'src/pages/Page';
import theme from 'src/style';

import {
  createReviewFormConfigFactory,
  createReviewWithProConfigFactory,
  Map,
  SearchDropdown,
} from 'src/components';
import {
  FilterContext,
  InitialDataContext,
  IntervalContext,
  MapContext,
  TranslationsContext,
} from 'src/providers';
import config from 'src/config';
import {
  useFilterProfessionals,
  useNavigateAction,
  useSearchProfessional,
  useProfessionalDetail,
} from 'src/hooks';
import { AddIcon } from '@chakra-ui/icons';
import Icons from 'src/components/Icons';
import { unknownObjectValidator, getMergedStyle } from 'src/helpers';
import PropTypes from 'prop-types';
import Modal from 'src/components/Modal';
import ProfessionalInfo from 'src/components/ProfessionalInfo';

function useStyle(showFullWidthInput) {
  const style = {
    filter: {
      gap: '0.4rem',
      flexWrap: 'wrap',
    },
    filterDropdown: {
      flexGrow: 0,
    },
    filterButtons: {
      gap: '0.4rem',
      flexWrap: 'wrap',
    },
    filterBtn: {
      flexShrink: 0,
    },
    filterInfo: {
      alignItems: 'center',
      cursor: 'pointer',
      paddingLeft: theme.space[3],
      border: `1px solid ${theme.colors.gray[200]}`,
      borderRadius: theme.radii.md,
      flexGrow: 0,
      overflowX: 'hidden',
    },
    filterInfoIcon: {
      boxSizing: 'content-box',
      padding: '0.2rem',
      margin: '0.3rem 0.3rem 0.3rem 0.3rem',
      border: 'none',
      background: 'none',
      marginLeft: 'auto',
    },
    filterInfoBlock: {
      borderRight: `1px solid ${theme.colors.gray[200]}`,
      paddingRight: theme.space[2],
      marginRight: theme.space[2],
      overflowX: 'hidden',
      ':last-of-type': {
        border: 'none',
        paddingRight: 0,
      },
      lineHeight: 1,
      color: theme.colors.gray[400],
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      maxWidth: '220px',
    },
    mainSearch: {
      flexGrow: 0,
      width: 'auto',
    },
    topContent: {
      justifyContent: 'center',
      gap: '0.5rem',
    },
    addReviewBtn: {
      background: '#0b619e',
    },
  };

  const responsiveStyle = useBreakpointValue({
    base: {
      filter: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
      },
      topContent: {
        flexWrap: 'wrap',
      },
      filterInfo: {
        flexGrow: 1,
      },
      mainSearch: {
        flexGrow: 1,
      },
    },
    md: {
      filterDropdown: {
        flexGrow: 1,
      },
    },
    lg: {
      filter: { justifyContent: 'center' },
      mainSearch: { flexGrow: 0 },
    },
  });

  return getMergedStyle(style, responsiveStyle);
}

function FilterInfo({
  filterInputValues: filterInputValuesFromProps,
  onClick,
}) {
  const { T } = useContext(TranslationsContext);
  const data = useMemo(
    () =>
      Object.fromEntries(
        config.filter.elements.map(({ name, infoPlaceholder }) => [
          name,
          filterInputValuesFromProps && filterInputValuesFromProps[name]
            ? filterInputValuesFromProps[name]
            : T(infoPlaceholder),
        ]),
      ),
    [filterInputValuesFromProps, T],
  );
  const style = useStyle();

  return (
    <Flex sx={style.filterInfo} onClick={onClick}>
      {Object.entries(data).map(([fName, value]) => (
        <Box sx={style.filterInfoBlock} key={fName}>
          {value}
        </Box>
      ))}
      <Icons.FilterIcon sx={style.filterInfoIcon} />
    </Flex>
  );
}

FilterInfo.defaultProps = {};

FilterInfo.prototype.propTypes = {
  filterInputValues: unknownObjectValidator.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default function MapPage() {
  const { navigateAction, action } = useNavigateAction();
  const { T } = useContext(TranslationsContext);

  const { lists: filterInitialItems } = useContext(InitialDataContext);
  const { professionals, getFilteredProfessionals } = useFilterProfessionals();
  const { moveMap, setMapAreaRequest } = useContext(MapContext);
  const {
    filterItemsHookCreator,
    updateFilter,
    resetFilter,
    resetDraft,
    saveFilter,
    isFilterChanged,
    getIsFilterDefault,
    getIsFilterEqual,
    draft,
    isFilterShown,
    isFilterShownSetter,
    showFilter,
    hideFilter,
    filterInputValues,
    getFilterInputValSetter,
  } = useContext(FilterContext);
  const { professionalDetail, nextPage } = useProfessionalDetail();
  const { addSubscriber, setNextInterval } = useContext(IntervalContext);

  useEffect(() => {
    addSubscriber('getFilteredProfessionals', getFilteredProfessionals);
  }, []);

  const [markers, setMarkers] = useState(null);

  const modalsConfig = useMemo(
    () => ({
      'add-review': {
        title: T('your review'),
        submitButton: {
          label: T('submit'),
        },
        formConfig: createReviewFormConfigFactory(professionalDetail),
      },
      'add-review-with-professional': {
        title: T('your review'),
        submitButton: {
          label: T('submit'),
        },
        formConfig: createReviewWithProConfigFactory(({ id }) =>
          navigateAction('add-review', id),
        ),
      },
    }),
    [professionalDetail, T],
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

  return (
    <Page
      mode="fullscreen"
      modalsConfig={modalsConfig}
      topContent={
        <Flex sx={style.topContent}>
          <FilterInfo
            filterInputValues={filterInputValues}
            onClick={showFilter}
          />
          <SearchDropdown
            searchHook={useSearchProfessional}
            onValueSet={({ value: { id } }) => {
              navigateAction('professional-detail', id);
            }}
            position="left"
            placeholder={T('find person by name')}
            sx={style.mainSearch}
            setInputValOnValSet={false}
            showWithOverlay
          />
        </Flex>
      }
      onFilterOverlayClick={hideFilter}
      isFilterShown={isFilterShown}
      isFilterShownSetter={isFilterShownSetter}
      filterContent={
        <Flex sx={style.filter}>
          {config.filter.elements.map(
            ({ name: filterName, iconName, placeholder, valueMapper }) => {
              const useFilterItems = filterItemsHookCreator(filterName);
              const setInputVal = getFilterInputValSetter(filterName);
              return (
                <SearchDropdown
                  initialItems={filterInitialItems[filterName]}
                  key={filterName}
                  searchHook={useFilterItems}
                  onValueSet={({ value, extraData }) => {
                    updateFilter({
                      [filterName]: {
                        value: valueMapper ? valueMapper(value) : value,
                        extraData,
                        ...(config.APIColumnAliases[filterName]
                          ? {
                              columnAlias: config.APIColumnAliases[filterName],
                            }
                          : null),
                      },
                    });
                  }}
                  onValueEmpty={() => resetDraft(filterName)}
                  position="left"
                  placeholder={T(placeholder)}
                  inputVal={
                    (filterInputValues && filterInputValues[filterName]) || ''
                  }
                  inputValSetter={setInputVal}
                  dropdownWidth="100%"
                  {...(iconName
                    ? { icon: React.createElement(Icons[iconName]) }
                    : null)}
                  sx={style.filterDropdown}
                />
              );
            },
          )}
          <Flex sx={style.filterButtons}>
            <Button
              onClick={() => {
                if (!isFilterChanged) {
                  return;
                }
                saveFilter();
                if (!getIsFilterEqual('location')) {
                  // if location search, moving map and then getting pros on different place
                  moveMap({
                    position: draft.location.extraData,
                    bounds: draft.location.value,
                  });
                } else {
                  setNextInterval(); // calling professionals by setting next interval
                }
                hideFilter();
              }}
              sx={style.filterBtn}
              isDisabled={!isFilterChanged}
              colorScheme="blue"
            >
              {T('apply filter')}
            </Button>

            <Button
              isDisabled={getIsFilterDefault()}
              sx={style.filterBtn}
              variant="solid"
              onClick={() => {
                resetFilter();
                if (!getIsFilterDefault('location')) {
                  moveMap(config.map.defaultArea);
                } else {
                  setNextInterval(); // calling professionals by setting next interval
                }
                hideFilter();
              }}
            >
              {T('reset filter')}
            </Button>
          </Flex>
        </Flex>
      }
      footer={
        <Button
          onClick={() => navigateAction('add-review-with-professional')}
          sx={style.addReviewBtn}
          colorScheme="blue"
          leftIcon={<AddIcon />}
        >
          {T('write review')}
        </Button>
      }
    >
      <Map
        markers={markers}
        onZoomOrMove={(mapAreaFromMap) => {
          setMapAreaRequest(mapAreaFromMap);
          setNextInterval(); // calling professionals by setting next interval
        }}
        onMarkerClick={({ id }) => {
          navigateAction('professional-detail', id);
        }}
      />
      <Modal
        isShown={!!professionalDetail && action === 'professional-detail'}
        close={() => navigateAction(null)}
        title={T('professional info')}
        onScrolledDown={nextPage}
      >
        <ProfessionalInfo
          data={professionalDetail || null}
          showRating
          showReviews
          showContact
        />
      </Modal>
    </Page>
  );
}
