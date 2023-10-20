import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { setLocalDataValue, getLocalDataValue } from 'src/helpers';
import Routes from 'src/Routes';
import {
  AuthProvider,
  FilterProvider,
  InitialDataProvider,
  LoaderProvider,
  MapProvider,
  UserIdProvider,
} from 'src/providers';

function App() {
  return (
    <BrowserRouter>
      <LoaderProvider>
        <InitialDataProvider>
          <AuthProvider>
            <FilterProvider>
              <MapProvider>
                <UserIdProvider>
                  <Routes />
                </UserIdProvider>
              </MapProvider>
            </FilterProvider>
          </AuthProvider>
        </InitialDataProvider>
      </LoaderProvider>
    </BrowserRouter>
  );
}

export default App;
