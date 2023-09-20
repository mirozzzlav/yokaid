import { useContext } from 'react';
import { AuthContext } from 'src/providers/AuthProvider';
import { getTokenFromResponse } from 'src/helpers';
import config from 'src/config';
import useCall from 'src/hooks/useCall';

export default function useAuthorizedCall(onCallFinish) {
  const { getAuthAccessToken, setAuthAccessToken } = useContext(AuthContext);
  const call = useCall((response, httpErrorCode) => {
    setAuthAccessToken(getTokenFromResponse(response, httpErrorCode));
    onCallFinish(response, httpErrorCode);
  });

  return (endpointURL, method = 'get', data = null) => {
    const accessToken = getAuthAccessToken();
    const headers = {
      Authorization: `${config.auth.tokenType} ${accessToken}`,
    };
    call(endpointURL, method, data, headers);
  };
}
