import config from 'src/config';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Modal from 'src/UI/modal';
import { callStates } from 'src/constants';

const initialResponse = {
  error: null,
  data: null,
};

export default function useCall(responseModifier) {
  const [response, setResponse] = useState(initialResponse);
  const [httpResponseCode, setHttpResponseCode] = useState(null);
  const [state, setState] = useState(callStates.initial);

  useEffect(() => {
    if (response.state === 'error') {
      Modal({
        message: response.error.msg,
        type: 'alert',
      });
    }
  }, [response]);

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
        .then((rawResponse) => {
          setHttpResponseCode(rawResponse.status);
          return rawResponse.json();
        })
        .then((rawResponse) => {
          setState(callStates.ready);
          setResponse((prevResponse) => ({
            ...prevResponse,
            data: rawResponse,
            error: null,
            ...(responseModifier && responseModifier(rawResponse)),
          }));
        })
        .catch(() => {
          // Handle any errors
          setResponse((prevResponse) => ({
            ...prevResponse,
            error: 'Huups! Something went wrong.',
          }));
        });
    },
    [],
  );

  return {
    response: response.data || null, // data and error
    responseMeta: {
      isReady: state === callStates.ready,
      isError: !!response.error,
      isLoading: state === callStates.loading,
      httpCode: httpResponseCode,
    },
    call,
  };
}
