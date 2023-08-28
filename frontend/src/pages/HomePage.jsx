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
import { AuthContext, FilterContext, InitialDataContext } from 'src/providers';
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

  const setShownFormId = useCallback((formId) => {
    if (formId) {
      navigate(`/${formId}`);
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

  const { filterItemsHookCreator, updateFilter, resetFilter, saveFilter } =
    useContext(FilterContext);
  const useFilterItemsWhat = filterItemsHookCreator('what');
  const useFilterItemsWhere = filterItemsHookCreator('where');
  useEffect(() => {
    callGetMapPosts();
  }, []);

  return (
    <MainLayout
      mode="fullscreen"
      topContent={
        <>
          <SearchDropdown
            searchHook={useFilterItemsWhere}
            onValueSet={({ filterColumnAlias, value, extraData }) => {
              updateFilter({ [filterColumnAlias]: { value, extraData } });
            }}
            onValueEmpty={() => {
              resetFilter([config.map.columnAlias]);
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
              saveFilter();
              callGetMapPosts();
            }}
            sx={style.applyFiltersBtn}
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
        onZoomOrMove={({ bounds, position }) => {
          updateFilter(
            {
              [config.map.columnAlias]: {
                value: bounds,
                extraData: position,
              },
            },
            true,
          );
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
