import React from 'react';
import AuthProvider from 'src/providers/AuthProvider';
import { BrowserRouter } from 'react-router-dom';
import { useLocalStorage, useMapPosts } from 'src/hooks';
import Routes from 'src/Routes';
import MapProvider from 'src/providers/MapProvider';

function App() {
  const { setLocalDataValue, getLocalDataValue } = useLocalStorage();

  return (
    <BrowserRouter>
      <AuthProvider
        setLocalDataValue={setLocalDataValue}
        getLocalDataValue={getLocalDataValue}
      >
        <MapProvider mapPostsGetter={useMapPosts}>
          <Routes />
        </MapProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
