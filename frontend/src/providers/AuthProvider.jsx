import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

export const AuthContext = React.createContext([]);
export const storageKey = 'auth';

export default function AuthProvider({
  children,
  getLocalDataValue,
  setLocalDataValue,
}) {
  const setToken = useCallback((accessToken) => {
    setLocalDataValue(storageKey, 'accessToken', accessToken);
  }, []);

  const getToken = useCallback(
    () => getLocalDataValue(storageKey, 'accessToken') || null,
    [],
  );

  const contextVal = useMemo(
    () => ({
      getAuthAccessToken: getToken,
      setAuthAccessToken: setToken,
      isAuthorized: () => !!getToken(),
    }),
    [],
  );

  return (
    <AuthContext.Provider value={contextVal}>{children}</AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
  getLocalDataValue: PropTypes.func.isRequired,
  setLocalDataValue: PropTypes.func.isRequired,
};
