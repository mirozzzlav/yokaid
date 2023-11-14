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

function useStyle() {
  const style = {
    filter: {
      gap: '0.4rem',
      flexWrap: 'wrap',
    },
    filterButtons: {
      flexBasis: '100%',
      gap: '0.4rem',
      flexWrap: 'wrap',
    },
    filterBtn: {
      flexShrink: 0,
      flexGrow: 1,
      flexBasis: '100%',
    },
    filterInfo: {
      alignItems: 'center',
      cursor: 'pointer',
      padding: 0,
      flexGrow: 1,
      border: `1px solid ${theme.colors.gray[200]}`,
      borderRadius: theme.radii.md,
    },
    filterInfoIcon: {
      boxSizing: 'content-box',
      padding: '0 0.4rem',
      border: 'none',
      background: theme.colors.gray[200],
      height: '100%',
    },
    filterInfoBlock: {
      borderLeft: `1px solid ${theme.colors.gray[200]}`,
      padding: '0.4rem',
      flexGrow: 1,
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
      width: '120px',
      flexShrink: 0,
    },
    mainSearch: {
      flexGrow: 1,
    },
    topContent: {
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: '0.5rem',
    },
    addReviewBtn: {
      background: '#0b619e',
    },
    addReviewBtnMobile: {
      background: '#0b619e',
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
    },
    sm: {
      addReviewBtnMobile: {
        display: 'none',
      },
    },
    md: {
      addReviewBtnMobile: {
        display: 'none',
      },
      filterBtn: {
        flexBasis: 'auto',
      },
      filterButtons: {
        flexBasis: 'auto',
      },
      filterInfoBlock: {
        padding: '0.4rem 1rem 0.4rem 1rem',
      },
      filterInfoVal: {
        width: '160px',
      },
    },
    lg: {
      filter: { flexDirection: 'row' },
      filterBtn: {
        flexBasis: 'auto',
      },
      filterButtons: {
        flexBasis: 'auto',
      },
      addReviewBtnMobile: {
        display: 'none',
      },
      filterInfo: {
        flexGrow: 0,
      },
      filterInfoBlock: {
        padding: '0.4rem 1rem 0.4rem 1rem',
      },
      filterInfoVal: {
        width: '160px',
      },
      mainSearch: { flexGrow: 0 },
    },
  });

  return getMergedStyle(style, responsiveStyle);
}

function FilterInfo({
  filterInputValues: filterInputValuesFromProps,
  onClick,
  sx,
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
    <Flex sx={sx} onClick={onClick}>
      {Object.entries(data).map(([fName, value]) => (
        <Box sx={style.filterInfoBlock} key={fName}>
          <Text sx={style.filterInfoName}>{T(fName)}</Text>
          <Text sx={style.filterInfoVal}>{value}</Text>
        </Box>
      ))}
      <Icons.FilterIcon sx={style.filterInfoIcon} />
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
  const { navigateAction, action } = useNavigateAction();
  const { T } = useContext(TranslationsContext);

  const { filters: filterInitialItems } = useContext(InitialDataContext);
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
            onOutsideClick={hideFilter}
            sx={style.filterInfo}
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
          />
        </Flex>
      }
      onFilterOverlayClick={hideFilter}
      filterContent={
        isFilterShown ? (
          <Flex sx={style.filter}>
            {config.filter.elements.map(
              ({ name: filterName, iconName, placeholder }) => {
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
                variant="ghost"
                onClick={() => {
                  resetFilter();
                  if (!getIsFilterDefault('location')) {
                    moveMap(config.map.defaultArea);
                  } else {
                    setNextInterval(); // calling professionals by setting next interval
                  }
                }}
              >
                {T('reset filter')}
              </Button>
            </Flex>
          </Flex>
        ) : null
      }
      footer={
        <>
          <Button
            onClick={() => navigateAction('send-sms')}
            sx={{ marginRight: theme.space[2] }}
          >
            {T('SMS')}
          </Button>
          <Button
            onClick={() => navigateAction('add-review-with-professional')}
            sx={style.addReviewBtn}
            colorScheme="blue"
            leftIcon={<AddIcon />}
          >
            {T('write review')}
          </Button>
          <IconButton
            icon={<AddIcon />}
            onClick={() => navigateAction('add-review-with-professional')}
            sx={style.addReviewBtnMobile}
            colorScheme="blue"
            aria-label="Add review"
          />
        </>
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
