import React from 'react';
import AuthProvider from 'src/providers/AuthProvider';
import { BrowserRouter } from 'react-router-dom';
import { useLocalStorage } from 'src/hooks';
import Routes from 'src/Routes';

function App() {
  const { setLocalDataValue, getLocalDataValue } = useLocalStorage();

  return (
    <BrowserRouter>
      <AuthProvider
        setLocalDataValue={setLocalDataValue}
        getLocalDataValue={getLocalDataValue}
      >
        <Routes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
