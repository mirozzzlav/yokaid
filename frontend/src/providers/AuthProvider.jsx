import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { getLocalDataValue, setLocalDataValue } from 'src/helpers';

export const AuthContext = React.createContext({});
export const storageKey = 'auth';

export default function AuthProvider({ children }) {
  const getToken = useCallback(
    () => getLocalDataValue(storageKey, 'accessToken') || null,
    [],
  );
  const [isAuthorized, setIsAuthorized] = useState(!!getToken());
  const setToken = useCallback((accessToken) => {
    setIsAuthorized(!!accessToken);
    setLocalDataValue(storageKey, 'accessToken', accessToken);
  }, []);

  const contextVal = useMemo(
    () => ({
      getAuthAccessToken: getToken,
      setAuthAccessToken: setToken,
      logOut: () => setToken(null),
      isAuthorized,
    }),
    [isAuthorized],
  );

  return (
    <AuthContext.Provider value={contextVal}>{children}</AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
