import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Routes from 'src/Routes';
import {
  FilterProvider,
  GalleryProvider,
  InitialDataProvider,
  IntervalProvider,
  LoaderProvider,
  MapProvider,
  UserIdProvider,
} from 'src/providers';

function App() {
  return (
    <BrowserRouter>
      <IntervalProvider>
        <LoaderProvider>
          <InitialDataProvider>
            <FilterProvider>
              <MapProvider>
                <UserIdProvider>
                  <GalleryProvider>
                    <Routes />
                  </GalleryProvider>
                </UserIdProvider>
              </MapProvider>
            </FilterProvider>
          </InitialDataProvider>
        </LoaderProvider>
      </IntervalProvider>
    </BrowserRouter>
  );
}

export default App;
