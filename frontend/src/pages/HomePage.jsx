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
  FormModals,
  LoginForm,
  Map,
  ProfessionalReviews,
  SearchDropdown,
  SignupForm,
} from 'src/components';
import { useMenu, useProfessionals } from 'src/hooks';
import {
  AuthContext,
  FilterContext,
  InitialDataContext,
  MapContext,
} from 'src/providers';
import config from 'src/config';
import Modal from 'src/components/Modal';

const style = {
  applyFiltersBtn: {
    flexBasis: '120px !important',
    flexShrink: 0,
  },
};

export default function HomePage() {
  const { menuItems: userMenuItems, buttonStyle: userMenuBtnStyle } = useMenu();
  const navigate = useNavigate();
  const { action } = useParams();
  const { logOut } = useContext(AuthContext);
  const {
    filters: { what: initialItemsWhat },
  } = useContext(InitialDataContext);
  const { professionals, callGetProfessionals } = useProfessionals();
  const {
    moveMap,
    mapAreaRequestRef,

    setMapAreaRequest,
  } = useContext(MapContext);

  const setShownFormId = useCallback((formId) => {
    if (formId) {
      navigate(formId ? `/${formId}` : '/');
    } else {
      navigate('/');
    }
  }, []);

  useEffect(() => {
    if (action === 'logout') {
      logOut();
    }
  }, [action]);

  const modals = useMemo(
    () => [
      {
        id: 'login',
        title: 'Login',
        submitButton: {
          label: 'Login',
        },
        form: LoginForm,
      },
      {
        id: 'signup',
        title: 'Sign up',
        submitButton: {
          label: 'Sign up',
        },
        form: SignupForm,
      },
    ],
    [],
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

  const setIsProShown = useCallback(
    (isShown) => setSelectedMarkerId(isShown || null),
    [],
  );

  return (
    <MainLayout
      mode="fullscreen"
      topContent={
        <>
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
        modals={modals}
        shownFormId={action}
        setShownFormId={setShownFormId}
      />
      <ProfessionalReviews
        data={selectedPro}
        setIsShown={setIsProShown}
        isShown={selectedMarkerId}
      />
    </MainLayout>
  );
}
