import React, { useCallback, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import useCall from 'src/hooks/useCall';
import config from 'src/config';
import { TranslationsContext } from 'src/providers/TranslationsProvider';
import { dropdownResponseMapper } from 'src/hooks/useProfessionsSearch';

export const InitialDataContext = React.createContext({});

export default function InitialDataProvider({ children }) {
  const [initialData, setInitialData] = useState({
    lists: {
      profession: null,
      location: null,
    },
  });
  const { lang } = useContext(TranslationsContext);
  const onDataArrived = useCallback((response, success) => {
    if (!success) {
      return;
    }

    setInitialData({
      ...response.data,
      lists: {
        profession: dropdownResponseMapper(response.data.lists.profession),
        location: null,
      },
    });
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
