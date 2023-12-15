import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Routes from 'src/Routes';
import {
  FilterProvider,
  GalleryProvider,
  InitialDataProvider,
  IntervalProvider,
  TranslationsProvider,
  MapProvider,
  UserIdProvider,
  WindowProvider,
} from 'src/providers';

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
