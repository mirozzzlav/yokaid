import { useCallback, useRef } from 'react';

export default function useDelayedAction() {
  const timeoutIdRef = useRef(null);
  const callbackParamsRef = useRef(null);

  return useCallback((callback, callbackParams = null) => {
    callbackParamsRef.current = callbackParams;
    if (timeoutIdRef.current) {
      return;
    }
    timeoutIdRef.current = setTimeout(() => {
      if (callbackParamsRef.current) {
        callback(callbackParamsRef.current);
      } else {
        callback();
      }
      timeoutIdRef.current = null;
    }, 500);
  }, []);
}
