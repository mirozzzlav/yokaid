import { useCallback, useMemo, useState } from 'react';
import { callStates } from 'src/constants';

const initialResponse = {
  error: null,
  data: null,
};

export default function useCall(responseModifier) {
  const [response, setResponse] = useState(initialResponse);
  const [httpResponseCode, setHttpResponseCode] = useState(null);
  const [state, setState] = useState(callStates.initial);

  // useEffect(() => {
  //   if (response.state === 'error') {
  //     Modal({
  //       message: response.error.msg,
  //       type: 'alert',
  //     });
  //   }
  // }, [response]);

  const call = useCallback(
    (url, method = 'get', payload = null, headers = null) => {
      setResponse(initialResponse);
      setHttpResponseCode(null);
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
          setState(!r.error ? callStates.ready : callStates.error);
          setResponse((prevResponse) => ({
            ...prevResponse,
            data: typeof r.data === 'undefined' ? r : r.data,
            error: r.error || null,
            ...(responseModifier && responseModifier(r)),
          }));
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

  return useMemo(
    () => ({
      response, // data and error
      responseMeta: {
        isFinished: state === callStates.ready || state === callStates.error,
        isReady: state === callStates.ready,
        isError: state === callStates.error,
        isLoading: state === callStates.loading,
        httpCode: httpResponseCode,
      },
      call,
    }),
    [response, state],
  );
}
