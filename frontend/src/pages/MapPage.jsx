import React, { useContext, useEffect, useMemo, useState } from 'react';
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

  const {
    filters: { what: initialItemsWhat },
  } = useContext(InitialDataContext);
  const { professionals, callGetProfessionals } = useGetProfessionals();
  const { moveMap, setMapAreaRequest } = useContext(MapContext);

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
          onProfessionalFound: ({ id, locationLat, locationLng }) =>
            navigateAction(
              'add-review',
              btoa(
                JSON.stringify({ id, position: [locationLat, locationLng] }),
              ),
            ),
        }),
      },
    }),
    [selectedPro],
  );

  useEffect(() => {
    const proRequest =
      (action === 'professional-detail' || action === 'add-review') &&
      actionParams
        ? actionParams
        : null;

    if (professionals) {
      const tmpPro = proRequest
        ? professionals.find(({ id }) => proRequest.id === id) || null
        : null;

      setSelectedPro(tmpPro);

      setMarkers(
        professionals.map(({ locationLat, locationLng, id }) => ({
          locationLat,
          locationLng,
          id,
        })),
      );
      return;
    }

    setMapAreaRequest(
      proRequest
        ? { position: proRequest.position, bounds: config.map.defaultBounds }
        : config.map.defaultArea,
    );
  }, [action, actionParams, professionals]);

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
        onMarkerClick={(onClickData) =>
          navigateAction(
            'professional-detail',
            btoa(JSON.stringify(onClickData)),
          )
        }
      />
      <FormModals
        modalsConfig={modalsConfig}
        shownModalId={action}
        setShownModalId={navigateAction}
      />
      <ProfessionalInfoModal
        data={action === 'professional-detail' ? selectedPro : null}
        close={() => navigateAction(null)}
        isShown={!!selectedPro}
      />
    </Page>
  );
}
