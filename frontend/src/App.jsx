import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Routes from 'src/Routes';
import {
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
          <FilterProvider>
            <MapProvider>
              <UserIdProvider>
                <Routes />
              </UserIdProvider>
            </MapProvider>
          </FilterProvider>
        </InitialDataProvider>
      </LoaderProvider>
    </BrowserRouter>
  );
}

export default App;
