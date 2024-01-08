import React from 'react';
import {
  BrowserRouter,
  Route,
  Routes as RoutesReactDom,
} from 'react-router-dom';
import routes from 'src/routes';
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
  const menuRoutes = routes.filter(({ notInMenu }) => !notInMenu, [routes]);
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
                      <RoutesReactDom>
                        {routes.map(({ name, path, renderer }) => (
                          <Route
                            strict
                            exact
                            key={name}
                            path={path}
                            element={React.createElement(renderer, {
                              menuRoutes,
                            })}
                          />
                        ))}
                      </RoutesReactDom>
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
