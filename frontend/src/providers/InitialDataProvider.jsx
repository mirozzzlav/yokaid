import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import useCall from 'src/hooks/useCall';
import config from 'src/config';

export const InitialDataContext = React.createContext({});

export default function InitialDataProvider({ children }) {
  const [initialData, setInitialData] = useState({
    filters: {
      what: null,
    },
  });
  const onDataArrived = useCallback((response) => {
    if (response.error) {
      return;
    }

    setInitialData(response.data);
  }, []);
  const call = useCall(onDataArrived);

  useEffect(() => call(config.api.endPointsURLs.getInitialData, 'get'), []);

  return (
    <InitialDataContext.Provider value={initialData}>
      {children}
    </InitialDataContext.Provider>
  );
}

InitialDataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
