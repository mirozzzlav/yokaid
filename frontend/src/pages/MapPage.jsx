import React, { useContext, useEffect, useMemo } from 'react';
import { Button } from '@chakra-ui/react';
import Page from 'src/pages/Page';

import {
  createReviewFormFactory,
  FormModals,
  Map,
  SearchDropdown,
  ProfessionalInfoModal,
} from 'src/components';
import { FilterContext, InitialDataContext, MapContext } from 'src/providers';
import config from 'src/config';
import { useGetProfessionals, useNavigateAction } from 'src/hooks';

const style = {
  applyFiltersBtn: {
    flexBasis: '120px',
    flexShrink: 0,
  },
  addReviewBtn: {
    flexBasis: '150px',
    flexShrink: 0,
  },
};

export default function MapPage() {
  const { navigateAction, action, actionParams } = useNavigateAction();

  const professionalId = useMemo(
    () => (action === 'professional-detail' ? actionParams : null),
    [action, actionParams],
  );

  const {
    filters: { what: initialItemsWhat },
  } = useContext(InitialDataContext);
  const { professionals, callGetProfessionals } = useGetProfessionals();
  const { moveMap, mapAreaRequestRef, setMapAreaRequest } =
    useContext(MapContext);

  const modalsConfig = useMemo(
    () => ({
      'add-review': {
        title: 'Add review',
        submitButton: {
          label: 'Submit',
        },
        form: createReviewFormFactory(actionParams || null, {
          onProfessionalFound: (professional) =>
            navigateAction('add-review', btoa(JSON.stringify(professional))),
        }),
      },
    }),
    [action, actionParams],
  );
  const {
    filterItemsHookCreator,
    updateFilter,
    resetFilter,
    saveFilter,
    isFilterChanged,
    getIsFilterEqual,
    draft,
  } = useContext(FilterContext);
  const useFilterItemsWhat = filterItemsHookCreator('what');
  const useFilterItemsWhere = filterItemsHookCreator('where');
  useEffect(() => {
    moveMap(mapAreaRequestRef.current);
    callGetProfessionals();
  }, []);

  const markers = useMemo(() => {
    if (!professionals) {
      return null;
    }
    return professionals.map(({ locationLat, locationLng, id }) => ({
      locationLat,
      locationLng,
      id,
    }));
  }, [professionals]);

  const selectedPro = useMemo(() => {
    if (professionalId && professionals) {
      return professionals.find(({ id }) => professionalId === id) || null;
    }
    return null;
  }, [professionalId, professionals]);

  return (
    <Page
      mode="fullscreen"
      topContent={
        <>
          <Button
            onClick={() => navigateAction('add-review')}
            sx={style.addReviewBtn}
            colorScheme="blue"
          >
            Add your review
          </Button>
          <SearchDropdown
            searchHook={useFilterItemsWhere}
            onValueSet={({ value, extraData, filterColumnAlias }) => {
              updateFilter({ [filterColumnAlias]: { value, extraData } });
            }}
            onValueEmpty={() => {
              updateFilter({
                [config.map.columnAlias]: {
                  extraData: config.map.defaultPosition,
                  value: config.map.defaultBounds,
                },
              });
            }}
            position="left"
            placeholder="Where?"
          />
          <SearchDropdown
            searchHook={useFilterItemsWhat}
            onValueSet={({ value, filterColumnAlias }) => {
              updateFilter({ [filterColumnAlias]: { value } });
            }}
            onValueEmpty={() => {
              resetFilter(['serviceId']);
            }}
            position="left"
            placeholder="What?"
            initialItems={initialItemsWhat}
          />

          <Button
            onClick={() => {
              if (!isFilterChanged) {
                return;
              }

              if (getIsFilterEqual(config.map.columnAlias)) {
                callGetProfessionals();
              } else {
                moveMap({
                  position: draft[config.map.columnAlias].extraData,
                  bounds: draft[config.map.columnAlias].value,
                });
              }
              saveFilter();
            }}
            sx={style.applyFiltersBtn}
            isDisabled={!isFilterChanged}
          >
            Apply Filters
          </Button>
        </>
      }
    >
      <Map
        markers={markers}
        onZoomOrMove={(mapAreaFromMap) => {
          setMapAreaRequest(mapAreaFromMap);
          callGetProfessionals();
        }}
        onMarkerClick={(proId) => navigateAction('professional-detail', proId)}
      />
      <FormModals
        modalsConfig={modalsConfig}
        shownModalId={action}
        setShownModalId={navigateAction}
      />
      {selectedPro && (
        <ProfessionalInfoModal
          data={selectedPro}
          close={() => navigateAction(null)}
          isShown={!!professionalId}
        />
      )}
    </Page>
  );
}
