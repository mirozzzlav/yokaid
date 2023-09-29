import { useContext } from 'react';
import config from 'src/config';
import useCall from 'src/hooks/useCall';
import { getTokenFromResponse } from 'src/helpers';
import { AuthContext } from 'src/providers/AuthProvider';

export function useLoginCall(onCallFinish) {
  const { setAuthAccessToken } = useContext(AuthContext);
  const call = useCall((response, httpErrorCode) => {
    setAuthAccessToken(getTokenFromResponse(response, httpErrorCode));
    onCallFinish(response);
  });

  return (inputs) => call(config.api.endPointsURLs.loginUser, 'post', inputs);
}
export function useSignupCall(onCallFinish) {
  const call = useCall(onCallFinish);

  return (inputs) => {
    call(config.api.endPointsURLs.signupUser, 'post', inputs);
  };
}
