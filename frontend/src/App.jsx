import React from 'react';
import AuthProvider from 'src/providers/AuthProvider';
import { BrowserRouter } from 'react-router-dom';
import { useLocalStorage, useMapPosts } from 'src/hooks';
import Routes from 'src/Routes';
import {
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
            <MapProvider searchMapPostsHook={useMapPosts}>
              <Routes />
            </MapProvider>
          </AuthProvider>
        </InitialDataProvider>
      </LoaderProvider>
    </BrowserRouter>
  );
}

export default App;
