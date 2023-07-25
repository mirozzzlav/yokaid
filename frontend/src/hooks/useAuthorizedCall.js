import config from 'src/config';
import useCall from 'src/hooks/useCall';
import { useCallback, useContext } from 'react';
import { AuthContext } from 'src/providers';

function getTokenFromResponse(response) {
  if (response.error) {
    return null;
  }

  if (response?.data.access_token) {
    return response?.data.access_token;
  }

  if (response.refresh_token) {
    return response.refresh_token;
  }

  return null;
}

function useAuthorizedCall(onCallFinish) {
  const { getAuthAccessToken, setAuthAccessToken } = useContext(AuthContext);
  const onAuthCallFinish = useCallback((response, httpErrorCode) => {
    if (httpErrorCode === '401') {
      setAuthAccessToken(null);
    }
    setAuthAccessToken(getTokenFromResponse(response));
  }, []);
  const call = useCall(onAuthCallFinish);

  return (endpointURL, method = 'get', data = null) => {
    const accessToken = getAuthAccessToken();
    const headers = {
      Authorization: `${config.auth.tokenType} ${accessToken}`,
    };
    call(endpointURL, method, data, headers);
  };
}
