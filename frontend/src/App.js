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
  WindowProvider,
} from 'src/providers';

function App() {
  return (
    <BrowserRouter>
      <LoaderProvider>
        <TranslationsProvider>
          <IntervalProvider>
            <InitialDataProvider>
              <WindowProvider>
                <FilterProvider>
                  <MapProvider>
                    <UserIdProvider>
                      <GalleryProvider>
                        <Routes />
                      </GalleryProvider>
                    </UserIdProvider>
                  </MapProvider>
                </FilterProvider>
              </WindowProvider>
            </InitialDataProvider>
          </IntervalProvider>
        </TranslationsProvider>
      </LoaderProvider>
    </BrowserRouter>
  );
}

export default App;
