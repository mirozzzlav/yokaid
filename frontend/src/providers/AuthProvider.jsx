import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import config from 'src/config';
import { useCall } from 'src/hooks';

export const AuthContext = React.createContext([]);
export const storageKey = 'auth';

export default function AuthProvider({
  children,
  getLocalDataValue,
  setLocalDataValue,
}) {
  const { call, response, responseMeta } = useCall();

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
      loginUser({ usernameOrEmail, password }) {
        call(config.api.endPointsURLs.loginUser, 'post', {
          username_or_email: usernameOrEmail,
          password,
        });
      },
      authorizedCall(endpointURL, method = 'get', data = null) {
        const accessToken = getToken();
        const headers = {
          Authorization: `${config.auth.tokenType} ${accessToken}`,
        };
        call(endpointURL, method, data, headers);
      },
      response,
      responseMeta,
      isAuthorized,
    }),
    [response, isAuthorized],
  );

  useEffect(() => {
    if (responseMeta.isReady) {
      let accessToken = null;
      if (response?.data.access_token) {
        accessToken = response.data.access_token;
      }
      if (response.refresh_token) {
        accessToken = response.refresh_token;
      }

      setToken(accessToken);
    }

    if (responseMeta.isError && responseMeta.httpCode === 401) {
      setToken(null);
    }
  }, [response, responseMeta]);

  return (
    <AuthContext.Provider value={contextVal}>{children}</AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
  getLocalDataValue: PropTypes.func.isRequired,
  setLocalDataValue: PropTypes.func.isRequired,
};
