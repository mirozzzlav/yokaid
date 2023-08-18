import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import MainLayout from 'src/layouts/MainLayout';
import { MapContext } from 'src/providers/MapProvider';
import {
  FormModals,
  SignupForm,
  SearchDropdown,
  LoginForm,
  Map,
} from 'src/components';
import { useMenu } from 'src/hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext, FilterContext, InitialDataContext } from 'src/providers';

export default function HomePage() {
  const { setMapPosition, resetMap } = useContext(MapContext);
  const { menuItems: userMenuItems, buttonStyle: userMenuBtnStyle } = useMenu();
  const navigate = useNavigate();
  const { action } = useParams();
  const { logOut } = useContext(AuthContext);
  const {
    filters: { what: initialItemsWhat },
  } = useContext(InitialDataContext);

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

  const { filterItemsHookCreator, updateFilter } = useContext(FilterContext);
  const useFilterItemsWhat = filterItemsHookCreator('what');
  const useFilterItemsWhere = filterItemsHookCreator('where');

  return (
    <MainLayout
      mode="fullscreen"
      topContent={
        <>
          <SearchDropdown
            searchHook={useFilterItemsWhere}
            onItemClick={({ value }) => {
              setMapPosition(value);
            }}
            onInputEmpty={resetMap}
            position="left"
            placeholder="Where?"
          />
          <SearchDropdown
            searchHook={useFilterItemsWhat}
            onItemClick={({ filterColumnAlias, value }) => {
              updateFilter({
                filterColumnAlias,
                filterOperator: '=',
                filterValue: value,
              });
            }}
            position="left"
            placeholder="What?"
            initialItems={initialItemsWhat}
          />
        </>
      }
      userMenuItems={userMenuItems}
      userMenuBtnStyle={userMenuBtnStyle}
    >
      <Map />
      <FormModals
        modals={modals}
        shownFormId={action}
        setShownFormId={setShownFormId}
      />
    </MainLayout>
  );
}
