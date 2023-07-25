import React, { useContext, useMemo, useState } from 'react';
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

export default function HomePage() {
  const { setMapPosition } = useContext(MapContext);
  const [shownModal, setShownModal] = useState('');
  const userMenuItems = useMemo(
    () => [
      {
        onClick: () => setShownModal('login'),
        label: 'Login',
        id: 'login',
      },
      {
        onClick: () => setShownModal('signup'),
        label: 'Sign up',
        id: 'signup',
      },
    ],
    [],
  );

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
        <SearchDropdown
          searchHook={useMapSearch}
          onItemClick={setMapPosition}
          positionSetup="center"
          placeholder="Where?"
        />
      }
      userMenuItems={userMenuItems}
    >
      <Map />
      <FormModals
        modals={modals}
        shownModal={shownModal}
        setShownModal={setShownModal}
      />
    </MainLayout>
  );
}
