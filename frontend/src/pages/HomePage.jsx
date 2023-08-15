import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import MainLayout from 'src/layouts/MainLayout';
import useMapSearch from 'src/hooks/useMapSearch';
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
import { AuthContext, InitialDataContext } from 'src/providers';

export default function HomePage() {
  const { setMapPosition } = useContext(MapContext);
  const { menuItems: userMenuItems, buttonStyle: userMenuBtnStyle } = useMenu();
  const navigate = useNavigate();
  const { action } = useParams();
  const { logOut } = useContext(AuthContext);
  const initialData = useContext(InitialDataContext);

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

  return (
    <MainLayout
      mode="fullscreen"
      topContent={
        <>
          <SearchDropdown
            searchHook={useMapSearch}
            onItemClick={setMapPosition}
            position="center"
            placeholder="Where?"
          />
          <SearchDropdown
            searchHook={useMapSearch}
            onItemClick={() => {}}
            position="center"
            placeholder="What?"
            initialItems={initialData?.itemCategoriesDropdown}
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
