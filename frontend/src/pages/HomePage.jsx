import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@chakra-ui/react';
import MainLayout from 'src/layouts/MainLayout';
import {
  createReviewFormFactory,
  loginFormFactory,
  signupFormFactory,
  FormModals,
  Map,
  SearchDropdown,
  ProfessionalInfoModal,
} from 'src/components';
import { useMenu, useGetProfessionals } from 'src/hooks';
import {
  AuthContext,
  FilterContext,
  InitialDataContext,
  MapContext,
} from 'src/providers';
import config from 'src/config';

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

export default function HomePage() {
  const { menuItems: userMenuItems, buttonStyle: userMenuBtnStyle } = useMenu();
  const navigate = useNavigate();
  const { action, actionParams } = useParams();
  const { logOut } = useContext(AuthContext);
  const {
    filters: { what: initialItemsWhat },
  } = useContext(InitialDataContext);
  const { professionals, callGetProfessionals } = useGetProfessionals();
  const {
    moveMap,
    mapAreaRequestRef,

    setMapAreaRequest,
  } = useContext(MapContext);

  const setShownModalId = useCallback((modalId) => {
    if (modalId) {
      navigate(modalId ? `/${modalId}` : '/');
    } else {
      navigate('/');
    }
  }, []);

  useEffect(() => {
    if (action === 'logout') {
      logOut();
    }
  }, [action]);

  const modalsConfig = useMemo(
    () => ({
      login: {
        title: 'Login',
        submitButton: {
          label: 'Login',
        },
        form: loginFormFactory(),
      },
      signup: {
        title: 'Sign up',
        submitButton: {
          label: 'Sign up',
        },
        form: signupFormFactory(),
      },
      'add-review': {
        title: 'Add review',
        submitButton: {
          label: 'Submit',
        },
        form: createReviewFormFactory(
          actionParams ? JSON.parse(atob(actionParams)) : null,
          {
            onProfessionalFound: (professional) =>
              navigate(`/add-review/${btoa(JSON.stringify(professional))}`),
          },
        ),
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

  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  const selectedPro = useMemo(() => {
    if (selectedMarkerId && professionals) {
      return professionals.find(({ id }) => selectedMarkerId === id) || null;
    }
    return null;
  }, [selectedMarkerId, professionals]);

  return (
    <MainLayout
      mode="fullscreen"
      topContent={
        <>
          <Button
            onClick={() => navigate('/add-review')}
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
      userMenuItems={userMenuItems}
      userMenuBtnStyle={userMenuBtnStyle}
    >
      <Map
        markers={markers}
        onZoomOrMove={(mapAreaFromMap) => {
          setMapAreaRequest(mapAreaFromMap);
          callGetProfessionals();
        }}
        onMarkerClick={setSelectedMarkerId}
      />
      <FormModals
        modalsConfig={modalsConfig}
        shownModalId={action}
        setShownModalId={setShownModalId}
      />
      {selectedPro && (
        <ProfessionalInfoModal
          data={selectedPro}
          close={() => setSelectedMarkerId(null)}
          isShown={selectedMarkerId}
        />
      )}
    </MainLayout>
  );
}
