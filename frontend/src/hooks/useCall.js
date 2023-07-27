import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { callStates } from 'src/constants';
import { LoaderContext } from 'src/providers/LoaderProvider';
import { AuthContext } from 'src/providers';
import config from 'src/config';
import { getTokenFromResponse } from 'src/helpers';

const initialResponse = {
  error: null,
  data: null,
};

export default function useCall(onCallFinish = null) {
  const [response, setResponse] = useState(initialResponse);
  const [httpResponseCode, setHttpResponseCode] = useState(null);
  const [state, setState] = useState(callStates.initial);
  const { setIsLoading } = useContext(LoaderContext);

  const call = useCallback(
    (url, method = 'get', payload = null, headers = null) => {
      setState(callStates.loading);
      fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        ...(payload && { body: JSON.stringify(payload) }),
      })
        .then((r) => {
          setHttpResponseCode(r.status);
          return r.json();
        })
        .then((r) => {
          setState(callStates.finished);
          setResponse((prevResponse) => {
            if (typeof r.data === 'undefined') {
              // no data field - it is coming from some external API response
              return {
                data: r,
              };
            }
            return {
              ...prevResponse,
              ...r,
            };
          });
        })
        .catch(() => {
          // Handle any errors
          setState(callStates.error);
          setResponse((prevResponse) => ({
            ...prevResponse,
            error: 'Huups! Something went wrong.',
          }));
        });
    },
    [],
  );

  useEffect(() => {
    setIsLoading(state === callStates.loading);
    if (!onCallFinish) {
      return;
    }
    if (state === callStates.finished) {
      onCallFinish(response, httpResponseCode);
    }
  }, [state, response, httpResponseCode]);

  return call;
}

export function useAuthorizedCall(onCallFinish) {
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
