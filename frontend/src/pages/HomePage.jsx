import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@chakra-ui/react';
import MainLayout from 'src/layouts/MainLayout';
import {
  DataPicker,
  FormModals,
  LoginForm,
  Map,
  SearchDropdown,
  SignupForm,
} from 'src/components';
import { useMenu, useMapPosts } from 'src/hooks';
import {
  AuthContext,
  FilterContext,
  InitialDataContext,
  MapContext,
} from 'src/providers';
import config from 'src/config';
import { toServerDate } from 'src/helpers';

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
  const { mapPosts, callGetMapPosts } = useMapPosts();
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
        submitButtonLabel: 'Login',
        form: LoginForm,
      },
      {
        id: 'signup',
        title: 'Sign up',
        submitButtonLabel: 'Sign up',
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
    callGetMapPosts();
  }, []);

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
              resetFilter(['categoryId']);
            }}
            position="left"
            placeholder="What?"
            initialItems={initialItemsWhat}
          />

          <DataPicker
            placeholder="When?"
            onValueSet={(from, to) => {
              updateFilter({
                rentDateFrom: { value: toServerDate(from) },
                ...(to
                  ? { rentDateTo: { value: toServerDate(to, true) } }
                  : null),
              });
            }}
            onValueEmpty={() => {
              resetFilter(['rentDateFrom', 'rentDateTo']);
            }}
          />
          <Button
            onClick={() => {
              if (!isFilterChanged) {
                return;
              }

              if (getIsFilterEqual(config.map.columnAlias)) {
                callGetMapPosts();
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
        mapPosts={mapPosts}
        onZoomOrMove={(mapAreaFromMap) => {
          setMapAreaRequest(mapAreaFromMap);
          callGetMapPosts();
        }}
      />
      <FormModals
        modals={modals}
        shownFormId={action}
        setShownFormId={setShownFormId}
      />
    </MainLayout>
  );
}
