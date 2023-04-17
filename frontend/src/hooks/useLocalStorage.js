import { useMemo } from 'react';

export default function useLocalStorage() {
  return useMemo(
    () => ({
      setLocalDataValue(storageKey, dataKey, dataValue) {
        let data = localStorage.getItem(storageKey) || '{}';
        data = JSON.parse(data);
        localStorage.setItem(
          storageKey,
          JSON.stringify({ ...data, [dataKey]: dataValue }),
        );
      },
      getLocalDataValue(storageKey, dataKey) {
        let data = localStorage.getItem(storageKey);
        if (!data) {
          return null;
        }
        data = JSON.parse(data);
        return !data[dataKey] ? null : data[dataKey];
      },
    }),
    [],
  );
}
