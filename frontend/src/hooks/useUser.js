import { useMemo } from 'react';
import config from 'src/config';
import useCall from 'src/hooks/useCall';

export default function useUser({
  onLoginFinish = null,
  onSignupFinish = null,
}) {
  const callLogin = useCall(onLoginFinish);
  const callSignup = useCall(onSignupFinish);

  return useMemo(
    () => ({
      loginUser({ usernameOrEmail, password }) {
        callLogin(config.api.endPointsURLs.loginUser, 'post', {
          username_or_email: usernameOrEmail,
          password,
        });
      },
      signupUser({ firstName, lastName, email }) {
        callSignup(config.api.endPointsURLs.signupUser, 'post', {
          full_name: `${firstName} ${lastName}`,
          email,
          role: 'guest',
        });
      },
    }),
    [],
  );
}
