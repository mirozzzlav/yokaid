import config from 'src/config';
import { useCallback, useMemo, useState } from 'react';

const callStates = {
  initial: 'initial',
  loading: 'loading',
  error: 'error',
  ready: 'ready',
};

const initialResponse = {
  state: callStates.initial,
  calledEndPoint: null,
  httpResponseCode: null,
  error: null,
  data: null,
};

export default function useApiCall() {
  const [response, setResponse] = useState(initialResponse);

  const call = useCallback(
    (endPoint, method = 'get', data = null, headers = null) => {
      setResponse({
        ...initialResponse,
        state: callStates.loading,
        calledEndPoint: endPoint,
      });
      fetch(`${config.api.url}/${endPoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        ...(data && { body: JSON.stringify(data) }),
      })
        .then((_response) => {
          setResponse((prevResp) => ({
            ...prevResp,
            httpResponseCode: _response.status,
          }));
          return _response.json();
        })
        .then((_response) => {
          setResponse((prevResponse) => ({
            ...prevResponse,
            state: _response.error ? callStates.error : callStates.ready,
            data: _response.data || null,
            error: _response.error || null,
          }));
        })
        .catch(() => {
          // Handle any errors
          setResponse((prevResponse) => ({
            ...prevResponse,
            state: callStates.error,
            error: 'Huups! Something went wrong.',
          }));
        });
    },
    [],
  );

  return useMemo(
    () => ({
      response: {
        ...response,
        isReady: response.state === callStates.ready,
        isError: response.state === callStates.error,
        isLoading: response.state === callStates.loading,
      },
      call,
    }),
    [call, response],
  );
}
