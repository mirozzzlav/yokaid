import { useCallback, useContext, useMemo } from 'react';
import config from 'src/config';
import useCall from 'src/hooks/useCall';
import { objToSnakeCase, getTokenFromResponse } from 'src/helpers';
import { AuthContext } from 'src/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { theme } from 'src/style';

export function useLoginCall(onCallFinish) {
  const { setAuthAccessToken } = useContext(AuthContext);
  const call = useCall((response, httpErrorCode) => {
    setAuthAccessToken(getTokenFromResponse(response, httpErrorCode));
    onCallFinish(response);
  });

  return useCallback(
    (inputs) =>
      call(config.api.endPointsURLs.loginUser, 'post', objToSnakeCase(inputs)),
    [],
  );
}
export function useSignupCall(onCallFinish) {
  const call = useCall(onCallFinish);

  return useCallback((inputs) => {
    call(config.api.endPointsURLs.signupUser, 'post', objToSnakeCase(inputs));
  }, []);
}

export function useMenu() {
  const { isAuthorized } = useContext(AuthContext);
  const navigate = useNavigate();
  return useMemo(() => {
    let menuItems = [
      {
        onClick: () => navigate('/login'),
        label: 'Login',
        value: 'login',
      },
      {
        onClick: () => navigate('/signup'),
        label: 'Sign up',
        value: 'signup',
      },
    ];
    if (isAuthorized) {
      menuItems = [
        {
          onClick: () => navigate('/account'),
          label: 'Account',
          value: 'account',
        },
        {
          onClick: () => navigate('/logout'),
          label: 'Log out',
          value: 'logOut',
        },
      ];
    }
    const buttonStyle = isAuthorized
      ? {
          background: theme.colors.green['100'],
          ':hover': { background: theme.colors.green['200'] },
        }
      : {
          background: theme.colors.gray['50'],
          ':hover': { background: theme.colors.gray['200'] },
        };

    return {
      menuItems,
      buttonStyle,
    };
  }, [isAuthorized]);
}
