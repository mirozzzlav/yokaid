import React from 'react';
import AuthProvider from 'src/providers/AuthProvider';
import { BrowserRouter } from 'react-router-dom';
import { useLocalStorage } from 'src/hooks';
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
        <MapProvider>
          <Routes />
        </MapProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
