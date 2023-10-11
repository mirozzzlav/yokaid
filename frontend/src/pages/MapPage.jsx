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
  contactProfessionalFactory,
  Map,
  SearchDropdown,
  ProfessionalInfoModal,
} from 'src/components';
import { FilterContext, InitialDataContext, MapContext } from 'src/providers';
import config from 'src/config';
import {
  useFilterProfessionals,
  useGetProfessional,
  useNavigateAction,
  useSearchProfessional,
} from 'src/hooks';
import { AddIcon } from '@chakra-ui/icons';
import Icons from 'src/components/Icons';
import {
  unknownObjectValidator,
  getMergedStyle,
  getStringFirstCaps,
  isInt,
} from 'src/helpers';
import PropTypes from 'prop-types';

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
  const data = useMemo(
    () =>
      Object.fromEntries(
        config.filter.elements.map(({ name, infoPlaceholder }) => [
          name,
          filterInputValuesFromProps && filterInputValuesFromProps[name]
            ? filterInputValuesFromProps[name]
            : infoPlaceholder,
        ]),
      ),
    [filterInputValuesFromProps],
  );
  const style = useStyle();

  return (
    <Flex sx={sx} onClick={onClick}>
      {Object.entries(data).map(([fName, value]) => (
        <Box sx={style.filterInfoBlock} key={fName}>
          <Text sx={style.filterInfoName}>{getStringFirstCaps(fName)}</Text>
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
  const { navigateAction, action, actionParams } = useNavigateAction();

  const { filters: filterInitialItems } = useContext(InitialDataContext);
  const { professionals, getFilteredProfessionals } = useFilterProfessionals();
  const [professionalDetail, setProfessionalDetail] = useState(null);
  const callGetProfessional = useGetProfessional(setProfessionalDetail);
  const { moveMap, setMapAreaRequest, mapAreaRequest } = useContext(MapContext);
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

  useEffect(() => {
    getFilteredProfessionals();
  }, []);

  const [markers, setMarkers] = useState(null);
  const professionalId = useMemo(() => {
    if (
      action === 'professional-detail' ||
      action === 'add-review' ||
      action === 'contact-professional'
    ) {
      if (isInt(actionParams)) {
        return parseInt(actionParams, 10);
      }
    }
    return null;
  }, [actionParams]);

  const modalsConfig = useMemo(
    () => ({
      'add-review': {
        title: 'Your review',
        submitButton: {
          label: 'Submit',
        },
        form: createReviewFormFactory(professionalDetail, {
          onProfessionalFound: ({ id }) => navigateAction('add-review', id),
        }),
      },
      'contact-professional': {
        title: 'Contact professional',
        submitButton: {
          label: 'Send',
        },
        form: contactProfessionalFactory(professionalDetail),
      },
    }),
    [professionalDetail, mapAreaRequest],
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
    setProfessionalDetail(null);
    if (professionalId) {
      callGetProfessional(actionParams);
    }
  }, [professionalId]);

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
            placeholder="Find person by name"
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
                    placeholder={placeholder}
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
                  if (getIsFilterEqual('location')) {
                    // if not location search getting pros according to filters
                    getFilteredProfessionals();
                  } else {
                    // if location search, moving map and then getting pros on different place
                    moveMap({
                      position: draft.location.extraData,
                      bounds: draft.location.value,
                    });
                  }
                  saveFilter();
                }}
                sx={style.filterBtn}
                isDisabled={!isFilterChanged}
                colorScheme="blue"
              >
                Apply Filter
              </Button>

              <Button
                isDisabled={getIsFilterDefault()}
                sx={style.filterBtn}
                variant="ghost"
                onClick={() => {
                  if (getIsFilterDefault('location')) {
                    getFilteredProfessionals();
                  } else {
                    moveMap(config.map.defaultArea);
                  }
                  resetFilter();
                }}
              >
                Reset filter
              </Button>
            </Flex>
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
            Write review
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
          getFilteredProfessionals();
        }}
        onMarkerClick={({ id }) => {
          navigateAction('professional-detail', id);
        }}
      />
      <ProfessionalInfoModal
        data={action === 'professional-detail' ? professionalDetail : null}
        close={() => navigateAction(null)}
        isShown={!!professionalDetail}
        contactProfessionalButton={{
          label: 'Send message',
          onClick: () => navigateAction('contact-professional', professionalId),
        }}
      />
    </Page>
  );
}
