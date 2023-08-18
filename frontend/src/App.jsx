import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useLocalStorage, useMapPostsCall } from 'src/hooks';
import Routes from 'src/Routes';
import {
  AuthProvider,
  FilterProvider,
  InitialDataProvider,
  LoaderProvider,
  MapProvider,
} from 'src/providers';

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
              <MapProvider mapPostsCallHook={useMapPostsCall}>
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
