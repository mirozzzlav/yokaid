import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import useCall from 'src/hooks/useCall';
import config from 'src/config';

export const InitialDAtaContext = React.createContext([]);

export default function InitialDataProvider({ children }) {
  const [initialData, setInitialData] = useState(null);
  const onDataArrived = useCallback((response) => {
    if (response.error) {
      return;
    }
    setInitialData({
      itemCategories: response.data.ItemCategories,
    });
  }, []);
  const call = useCall(onDataArrived);

  useEffect(() => call(config.api.endPointsURLs.getInitialData, 'get'), []);

  return (
    <InitialDAtaContext.Provider value={initialData}>
      {children}
    </InitialDAtaContext.Provider>
  );
}

InitialDataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
