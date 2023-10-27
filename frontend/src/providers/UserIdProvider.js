import React, { useCallback, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { getLocalDataValue, setLocalDataValue } from 'src/helpers';
import { InitialDataContext } from 'src/providers/InitialDataProvider';

export const UserIdContext = React.createContext({});

export default function UserIdProvider({ children }) {
  const loadUserId = useCallback(
    () => getLocalDataValue('localInputs', 'userId') || '',
    [],
  );
  const [userId, setUserId] = useState(loadUserId());
  const { inputFormats } = useContext(InitialDataContext);

  const contextVal = useMemo(
    () => ({
      userIdName: 'userPhone',
      userId,
      setUserId,
      saveUserId: () => setLocalDataValue('localInputs', 'userId', userId),
      loadUserId,
      inputFormat: inputFormats?.phone || '',
      validationRules: 'required,phone',
      getErrorMsg: ({ data: validationErrors, msg }) => {
        if (
          validationErrors &&
          Object.values(validationErrors).find(
            ({ field }) => field === 'userPhone',
          )
        ) {
          return `Ensure the phone match the format: ${inputFormats?.phone}`;
        }
        return msg || 'Unknown error happened.';
      },
    }),
    [userId, inputFormats],
  );

  return (
    <UserIdContext.Provider value={contextVal}>
      {children}
    </UserIdContext.Provider>
  );
}

UserIdProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
