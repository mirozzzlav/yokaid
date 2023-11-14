import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import useCall from 'src/hooks/useCall';
import config from 'src/config';
import { TranslationsContext } from 'src/providers/TranslationsProvider';

export const InitialDataContext = React.createContext({});

export default function InitialDataProvider({ children }) {
  const [initialData, setInitialData] = useState({
    filter: Object.fromEntries(
      config.filter.getNames().map((fName) => [fName, null]),
    ),
  });
  const { lang } = useContext(TranslationsContext);
  const onDataArrived = useCallback((response, success) => {
    if (!success) {
      return;
    }

    setInitialData(response.data);
  }, []);
  const { call } = useCall(onDataArrived);

  useEffect(
    () => call(config.api.endPointsURLs.getInitialData, [lang]),
    [lang],
  );

  return (
    <InitialDataContext.Provider value={initialData}>
      {children}
    </InitialDataContext.Provider>
  );
}

InitialDataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
