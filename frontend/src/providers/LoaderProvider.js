import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';

export const LoaderContext = React.createContext({});

export default function LoaderProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const contextVal = useMemo(
    () => ({
      isLoading,
      setIsLoading,
    }),
    [isLoading],
  );
  return (
    <LoaderContext.Provider value={contextVal}>
      {children}
    </LoaderContext.Provider>
  );
}

LoaderProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
