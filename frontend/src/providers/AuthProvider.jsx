import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import config from 'src/config';
import { useApiCall } from 'src/hooks';

export const AuthContext = React.createContext([]);
export const storageKey = 'auth';

export default function AuthProvider({
  children,
  getLocalDataValue,
  setLocalDataValue,
}) {
  const { call, response } = useApiCall();

  const getToken = useCallback(
    () => getLocalDataValue(storageKey, 'accessToken') || null,
    [],
  );
  const [isAuthorized, setIsAuthorized] = useState(!!getToken());

  const setToken = useCallback((accessToken) => {
    setLocalDataValue(storageKey, 'accessToken', accessToken);
    setIsAuthorized(!!accessToken);
  }, []);

  const contextVal = useMemo(
    () => ({
      loginUser({ username, password }) {
        call(config.api.endPoints.loginUser, 'post', {
          username,
          password,
        });
      },
      authorizedCall(endpoint, method = 'get', data = null) {
        const accessToken = getToken();
        const headers = {
          Authorization: `${config.auth.tokenType} ${accessToken}`,
        };
        call(endpoint, method, data, headers);
      },
      response,
      isAuthorized,
    }),
    [response, isAuthorized],
  );

  useEffect(() => {
    if (
      response.isReady &&
      response.calledEndPoint === config.api.endPoints.loginUser
    ) {
      const accessToken =
        response.data && response.data.access_token
          ? response.data.access_token
          : null;

      setToken(accessToken);
    }
    if (response.isError && response.httpResponseCode === 401) {
      setToken(null);
    }
  }, [response]);

  return (
    <AuthContext.Provider value={contextVal}>{children}</AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
  getLocalDataValue: PropTypes.func.isRequired,
  setLocalDataValue: PropTypes.func.isRequired,
};
