import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useLocalStorage } from 'src/hooks';
import Routes from 'src/Routes';
import {
  AuthProvider,
  FilterProvider,
  InitialDataProvider,
  LoaderProvider,
  MapProvider,
} from 'src/providers';
import config from 'src/config';

function App() {
  const { setLocalDataValue, getLocalDataValue } = useLocalStorage();

  return (
    <BrowserRouter>
      <LoaderProvider>
        <InitialDataProvider>
          <AuthProvider
            setLocalDataValue={setLocalDataValue}
            getLocalDataValue={getLocalDataValue}
          >
            <FilterProvider>
              <MapProvider>
                <Routes />
              </MapProvider>
            </FilterProvider>
          </AuthProvider>
        </InitialDataProvider>
      </LoaderProvider>
    </BrowserRouter>
  );
}

export default App;
