import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Routes from 'src/Routes';
import {
  FilterProvider,
  GalleryProvider,
  InitialDataProvider,
  IntervalProvider,
  TranslationsProvider,
  LoaderProvider,
  MapProvider,
  UserIdProvider,
} from 'src/providers';

function App() {
  return (
    <BrowserRouter>
      <LoaderProvider>
        <TranslationsProvider>
          <IntervalProvider>
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
          </IntervalProvider>
        </TranslationsProvider>
      </LoaderProvider>
    </BrowserRouter>
  );
}

export default App;
