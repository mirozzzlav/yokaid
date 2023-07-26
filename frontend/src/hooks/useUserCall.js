import { useCallback } from 'react';
import config from 'src/config';
import useCall from 'src/hooks/useCall';

export function useLoginCall(onCallFinish) {
  const call = useCall(onCallFinish);

  return useCallback(
    ({ usernameOrEmail, password }) =>
      call(config.api.endPointsURLs.loginUser, 'post', {
        username_or_email: usernameOrEmail,
        password,
      }),
    [],
  );
}
export function useSignupCall(onCallFinish) {
  const call = useCall(onCallFinish);

  return useCallback(
    ({ fullName, email }) =>
      call(config.api.endPointsURLs.signupUser, 'post', {
        full_name: fullName,
        email,
        role: 'guest',
      }),
    [],
  );
}
