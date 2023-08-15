import { useCallback, useRef } from 'react';

export default function useDelayedAction() {
  const timeoutIdRef = useRef(null);

  return useCallback((callback, callbackParams = null) => {
    if (timeoutIdRef.current) {
      return;
    }
    timeoutIdRef.current = setTimeout(() => {
      if (callbackParams) {
        callback(callbackParams);
      } else {
        callback();
      }
      timeoutIdRef.current = null;
    }, 500);
  }, []);
}
