import React from 'react';
import AuthProvider from 'src/providers/AuthProvider';
import { BrowserRouter } from 'react-router-dom';
import { useLocalStorage, useMapPosts } from 'src/hooks';
import Routes from 'src/Routes';
import MapProvider from 'src/providers/MapProvider';
import LoaderProvider from 'src/providers/LoaderProvider';

function App() {
  const { setLocalDataValue, getLocalDataValue } = useLocalStorage();

  return (
    <BrowserRouter>
      <LoaderProvider>
        <AuthProvider
          setLocalDataValue={setLocalDataValue}
          getLocalDataValue={getLocalDataValue}
        >
          <MapProvider mapPostsGetter={useMapPosts}>
            <Routes />
          </MapProvider>
        </AuthProvider>
      </LoaderProvider>
    </BrowserRouter>
  );
}

export default App;
